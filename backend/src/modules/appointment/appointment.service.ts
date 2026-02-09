/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Prisma, AppointmentStatus } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import {
  APPOINTMENT_TRANSITIONS,
  type CreateAppointmentDto,
  type UpdateAppointmentDto,
  type AppointmentListQuery,
  type AppointmentFull,
} from './appointment.types';

const FULL_INCLUDE = {
  customer: true,
  vehicle: true,
  assignedMechanic: true,
} satisfies Prisma.AppointmentInclude;

// Business hours config (can be moved to config later)
const BUSINESS_START_HOUR = 8; // 8 AM
const BUSINESS_END_HOUR = 18; // 6 PM
const SLOT_BUFFER_MINUTES = 15;

/**
 * Appointment Service — business logic for appointment scheduling.
 */
class AppointmentService {
  async findAll(query: AppointmentListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.AppointmentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.mechanicId) {
      where.assignedMechanicId = query.mechanicId;
    }

    if (query.dateFrom || query.dateTo) {
      where.appointmentDate = {};
      if (query.dateFrom) {
        where.appointmentDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.appointmentDate.lte = new Date(query.dateTo);
      }
    }

    const orderBy: Prisma.AppointmentOrderByWithRelationInput = {
      [query.sortBy ?? 'appointmentDate']: query.sortOrder ?? 'asc',
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          vehicle: {
            select: { id: true, make: true, model: true, year: true, licensePlate: true },
          },
          assignedMechanic: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { data: appointments, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number): Promise<AppointmentFull> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });

    if (!appointment) {
      throw new NotFoundError('Appointment', id);
    }
    return appointment;
  }

  async create(data: CreateAppointmentDto) {
    // Validate customer
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundError('Customer', data.customerId);
    }

    // Validate vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new NotFoundError('Vehicle', data.vehicleId);
    }

    // Validate mechanic if provided
    if (data.assignedMechanicId) {
      const mechanic = await prisma.employee.findUnique({ where: { id: data.assignedMechanicId } });
      if (!mechanic) {
        throw new NotFoundError('Employee', data.assignedMechanicId);
      }

      // Check for double-booking
      const conflict = await this.checkMechanicConflict(
        data.assignedMechanicId,
        new Date(data.appointmentDate),
        data.duration ?? 60,
      );
      if (conflict) {
        throw new BadRequestError('Mechanic is already booked at this time');
      }
    }

    return prisma.appointment.create({
      data: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        appointmentDate: new Date(data.appointmentDate),
        duration: data.duration ?? 60,
        serviceType: data.serviceType ?? null,
        assignedMechanicId: data.assignedMechanicId ?? null,
        notes: data.notes ?? null,
      },
      include: FULL_INCLUDE,
    });
  }

  async update(id: number, data: UpdateAppointmentDto) {
    const appointment = await this.findById(id);

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      throw new BadRequestError(`Cannot modify appointment with status "${appointment.status}"`);
    }

    // Check mechanic conflict if changing time or mechanic
    const mechanicId = data.assignedMechanicId ?? appointment.assignedMechanicId;
    if (mechanicId && (data.appointmentDate || data.assignedMechanicId)) {
      const apptDate = data.appointmentDate
        ? new Date(data.appointmentDate)
        : appointment.appointmentDate;
      const duration = data.duration ?? appointment.duration;

      const conflict = await this.checkMechanicConflict(mechanicId, apptDate, duration, id);
      if (conflict) {
        throw new BadRequestError('Mechanic is already booked at this time');
      }
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
        duration: data.duration,
        serviceType: data.serviceType,
        assignedMechanicId: data.assignedMechanicId,
        notes: data.notes,
      },
      include: FULL_INCLUDE,
    });
  }

  async transitionStatus(id: number, newStatus: AppointmentStatus) {
    const appointment = await this.findById(id);

    const allowed = APPOINTMENT_TRANSITIONS[appointment.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestError(
        `Cannot transition from ${appointment.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    return prisma.appointment.update({
      where: { id },
      data: { status: newStatus },
      include: FULL_INCLUDE,
    });
  }

  /**
   * Convert an appointment to a work order.
   */
  async convertToWorkOrder(
    id: number,
    data: { priority?: string; customerComplaint?: string | null; mileageIn?: number | null },
  ) {
    const appointment = await this.findById(id);

    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      throw new BadRequestError('Can only convert scheduled or confirmed appointments');
    }

    // Create work order and update appointment status in a transaction
    const [workOrder] = await prisma.$transaction([
      prisma.workOrder.create({
        data: {
          vehicleId: appointment.vehicleId,
          customerId: appointment.customerId,
          assignedMechanicId: appointment.assignedMechanicId,
          scheduledDate: appointment.appointmentDate,
          priority: (data.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') ?? 'NORMAL',
          customerComplaint: data.customerComplaint ?? appointment.notes,
          mileageIn: data.mileageIn ?? null,
        },
      }),
      prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      }),
    ]);

    return workOrder;
  }

  /**
   * Get available time slots for a given date.
   */
  async getAvailableSlots(date: string, mechanicId?: number, duration: number = 60) {
    const dayStart = new Date(date);
    dayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

    const where: Prisma.AppointmentWhereInput = {
      appointmentDate: { gte: dayStart, lt: dayEnd },
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
    };

    if (mechanicId) {
      where.assignedMechanicId = mechanicId;
    }

    const existingAppointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'asc' },
      select: { appointmentDate: true, duration: true },
    });

    // Generate available slots
    const slots: { start: string; end: string }[] = [];
    let currentTime = new Date(dayStart);

    while (currentTime.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);

      // Check if slot conflicts with any existing appointment
      const hasConflict = existingAppointments.some((appt) => {
        const apptStart = new Date(appt.appointmentDate);
        const apptEnd = new Date(
          apptStart.getTime() + (appt.duration + SLOT_BUFFER_MINUTES) * 60 * 1000,
        );
        return currentTime < apptEnd && slotEnd > apptStart;
      });

      if (!hasConflict) {
        slots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      // Move to next slot (30-min increments)
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  // ── Helper ──────────────────────────────────────────────

  private async checkMechanicConflict(
    mechanicId: number,
    date: Date,
    duration: number,
    excludeId?: number,
  ): Promise<boolean> {
    const apptEnd = new Date(date.getTime() + (duration + SLOT_BUFFER_MINUTES) * 60 * 1000);

    const where: Prisma.AppointmentWhereInput = {
      assignedMechanicId: mechanicId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      appointmentDate: { lt: apptEnd },
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const conflicts = await prisma.appointment.findMany({
      where,
      select: { appointmentDate: true, duration: true },
    });

    return conflicts.some((c) => {
      const cEnd = new Date(
        new Date(c.appointmentDate).getTime() + (c.duration + SLOT_BUFFER_MINUTES) * 60 * 1000,
      );
      return date < cEnd;
    });
  }
}

export const appointmentService = new AppointmentService();
