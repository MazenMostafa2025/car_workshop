import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@common/errors';

/**
 * Middleware factory: validates request against a Zod schema.
 *
 * The schema should define the shape of `body`, `params`, and/or `query`.
 * On success, parsed values replace the raw values on `req`.
 * On failure, throws a ValidationError with field-level details.
 *
 * Usage:
 *   router.post('/', validate(createCustomerSchema), controller.create);
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body?: unknown; params?: unknown; query?: unknown };

      // Replace raw values with parsed (typed, coerced, defaulted) values
      if (result.body) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.body = result.body as typeof req.body;
      }
      if (result.params) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.params = result.params as typeof req.params;
      }
      if (result.query) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.query = result.query as typeof req.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};
