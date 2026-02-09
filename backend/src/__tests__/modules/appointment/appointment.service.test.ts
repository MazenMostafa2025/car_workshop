/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError, BadRequestError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

import { appointmentService } from '@modules/appointment/appointment.service';

// ── Fixtures ──────────────────────────────────────────────
const baseAppointment = {
  id: 1,
  customerId: 1,
  vehicleId: 1,
  appointmentDate: new Date('2025-03-15T10:00:00Z'),
  duration: 60,
  serviceType: 'Oil Change',
  status: 'SCHEDULED' as const,
  assignedMechanicId: null,
  notes: null,
  reminderSent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: { id: 1, firstName: 'John', lastName: 'Doe' },
  vehicle: { id: 1, make: 'Toyota', model: 'Camry', licensePlate: 'ABC-123' },
  assignedMechanic: null,
};

describe('AppointmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated appointments', async () => {
      mockPrisma.appointment.findMany.mockResolvedValue([baseAppointment]);
      mockPrisma.appointment.count.mockResolvedValue(1);

      const result = await appointmentService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── findById ──────────────────────────────────────────
  describe('findById', () => {
    it('returns appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(baseAppointment);

      const result = await appointmentService.findById(1);
      expect(result.serviceType).toBe('Oil Change');
    });

    it('throws NotFoundError for missing appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);
      await expect(appointmentService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── create ────────────────────────────────────────────
  describe('create', () => {
    it('creates an appointment', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.appointment.create.mockResolvedValue(baseAppointment);

      const result = await appointmentService.create({
        customerId: 1,
        vehicleId: 1,
        appointmentDate: '2025-03-15T10:00:00Z',
      });

      expect(result.id).toBe(1);
    });

    it('throws NotFoundError for missing customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(
        appointmentService.create({
          customerId: 999,
          vehicleId: 1,
          appointmentDate: '2025-03-15T10:00:00Z',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for missing vehicle', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        appointmentService.create({
          customerId: 1,
          vehicleId: 999,
          appointmentDate: '2025-03-15T10:00:00Z',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('checks mechanic availability when mechanic is assigned', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 2, firstName: 'Mike' });

      // Mock conflict check — mechanic has a conflicting appointment
      mockPrisma.appointment.findMany.mockResolvedValue([
        {
          appointmentDate: new Date('2025-03-15T09:30:00Z'),
          duration: 60,
        },
      ]);

      await expect(
        appointmentService.create({
          customerId: 1,
          vehicleId: 1,
          appointmentDate: '2025-03-15T10:00:00Z',
          assignedMechanicId: 2,
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ── transitionStatus ──────────────────────────────────
  describe('transitionStatus', () => {
    it('transitions SCHEDULED -> CONFIRMED', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(baseAppointment);
      mockPrisma.appointment.update.mockResolvedValue({
        ...baseAppointment,
        status: 'CONFIRMED',
      });

      const result = await appointmentService.transitionStatus(1, 'CONFIRMED');
      expect(result.status).toBe('CONFIRMED');
    });

    it('rejects invalid transition', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        ...baseAppointment,
        status: 'CANCELLED',
      });

      await expect(appointmentService.transitionStatus(1, 'CONFIRMED')).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  // ── convertToWorkOrder ────────────────────────────────
  describe('convertToWorkOrder', () => {
    it('creates work order from scheduled appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(baseAppointment);
      const newWO = { id: 10, vehicleId: 1, customerId: 1, status: 'PENDING' };
      mockPrisma.$transaction.mockResolvedValue([newWO, {}]);

      const result = await appointmentService.convertToWorkOrder(1, {});

      expect(result.id).toBe(10);
    });

    it('rejects conversion of completed appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        ...baseAppointment,
        status: 'COMPLETED',
      });

      await expect(appointmentService.convertToWorkOrder(1, {})).rejects.toThrow(BadRequestError);
    });
  });

  // ── getAvailableSlots ─────────────────────────────────
  describe('getAvailableSlots', () => {
    it('returns available time slots', async () => {
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const slots = await appointmentService.getAvailableSlots('2025-03-15');

      // With no appointments, should return slots from 8am to 6pm (30-min increments, 60-min duration)
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toHaveProperty('start');
      expect(slots[0]).toHaveProperty('end');
    });

    it('excludes slots that conflict with existing appointments', async () => {
      // An appointment at 10:00 for 60 minutes + 15 min buffer
      mockPrisma.appointment.findMany.mockResolvedValue([
        {
          appointmentDate: new Date('2025-03-15T10:00:00'),
          duration: 60,
        },
      ]);

      const slots = await appointmentService.getAvailableSlots('2025-03-15');

      // 10:00 and 10:30 slots should be excluded
      const slotStarts = slots.map(
        (s: any) => new Date(s.start).getHours() * 60 + new Date(s.start).getMinutes(),
      );
      expect(slotStarts).not.toContain(600); // 10:00
      expect(slotStarts).not.toContain(630); // 10:30
    });
  });
});
