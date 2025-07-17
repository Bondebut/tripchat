import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Validate req.body with Zod schema
 * @param schema Zod schema
 * @returns Express middleware
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formatted = result.error.format();
      return res.status(400).json({ message: "Validation failed", errors: formatted });
    }
    req.body = result.data; // now type-safe
    next();
  };
};