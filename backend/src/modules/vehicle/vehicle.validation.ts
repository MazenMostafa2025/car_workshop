import { z } from 'zod';

const currentYear = new Date().getFullYear();

// ── Shared field schemas ──────────────────────────────────

const vehicleFields = {
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  year: z.coerce
    .number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
  vin: z.string().length(17, 'VIN must be exactly 17 characters').nullish().or(z.literal('')),
  licensePlate: z.string().max(20).nullish(),
  color: z.string().max(30).nullish(),
  mileage: z.coerce.number().int().min(0, 'Mileage cannot be negative').nullish(),
  engineType: z.string().max(50).nullish(),
  transmissionType: z.string().max(30).nullish(),
  notes: z.string().max(1000).nullish(),
};

// ── Create ────────────────────────────────────────────────

export const createVehicleSchema = z.object({
  body: z.object({
    customerId: z.coerce.number().int().positive('Customer ID is required'),
    make: vehicleFields.make,
    model: vehicleFields.model,
    year: vehicleFields.year,
    vin: vehicleFields.vin,
    licensePlate: vehicleFields.licensePlate,
    color: vehicleFields.color,
    mileage: vehicleFields.mileage,
    engineType: vehicleFields.engineType,
    transmissionType: vehicleFields.transmissionType,
    notes: vehicleFields.notes,
  }),
});

// ── Update (customerId not changeable) ────────────────────

export const updateVehicleSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    make: vehicleFields.make.optional(),
    model: vehicleFields.model.optional(),
    year: vehicleFields.year.optional(),
    vin: vehicleFields.vin,
    licensePlate: vehicleFields.licensePlate,
    color: vehicleFields.color,
    mileage: vehicleFields.mileage,
    engineType: vehicleFields.engineType,
    transmissionType: vehicleFields.transmissionType,
    notes: vehicleFields.notes,
    isActive: z.boolean().optional(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const vehicleIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List / Search Query ───────────────────────────────────

export const vehicleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    customerId: z.coerce.number().int().positive().optional(),
    make: z.string().max(50).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['make', 'model', 'year', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
export type VehicleIdInput = z.infer<typeof vehicleIdSchema>['params'];
export type VehicleListInput = z.infer<typeof vehicleListSchema>['query'];
