/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

/**
 * Creates a deeply mocked PrismaClient for unit testing.
 *
 * Each model exposes findUnique, findFirst, findMany, create, update, delete, count
 * as jest.fn() instances. The `$transaction` helper executes the array of promises.
 */
export function createMockPrismaClient(): jest.Mocked<PrismaClient> & Record<string, any> {
  const modelMethods = () => ({
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    upsert: jest.fn(),
  });

  const mock = {
    user: modelMethods(),
    customer: modelMethods(),
    employee: modelMethods(),
    vehicle: modelMethods(),
    supplier: modelMethods(),
    service: modelMethods(),
    serviceCategory: modelMethods(),
    part: { ...modelMethods(), fields: { reorderLevel: {} } },
    workOrder: modelMethods(),
    workOrderService: modelMethods(),
    workOrderPart: modelMethods(),
    purchaseOrder: modelMethods(),
    purchaseOrderItem: modelMethods(),
    invoice: modelMethods(),
    payment: modelMethods(),
    appointment: modelMethods(),
    serviceHistory: modelMethods(),
    expense: modelMethods(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  } as any;

  // $transaction: if array → Promise.all; if callback → call with mock as tx
  mock.$transaction.mockImplementation((args: any) => {
    if (Array.isArray(args)) {
      return Promise.all(args);
    }
    return (args as (tx: any) => Promise<any>)(mock);
  });

  return mock;
}
