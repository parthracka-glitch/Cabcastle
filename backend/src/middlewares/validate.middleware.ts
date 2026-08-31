import { Request, Response, NextFunction } from 'express';

export type ValidatorFn = (value: any) => { valid: boolean; error?: string };

export interface SchemaDefinition {
  [field: string]: {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (val: any) => boolean | string;
    message?: string;
  };
}

export function validateSchema(schema: SchemaDefinition, data: any): { valid: boolean; errors: { field: string; message: string }[] } {
  const errors: { field: string; message: string }[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }] };
  }

  for (const [field, rules] of Object.entries(schema)) {
    const val = data[field];

    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push({ field, message: rules.message || `${field} is required` });
      continue;
    }

    if (val !== undefined && val !== null) {
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(val)) {
            errors.push({ field, message: `${field} must be an array` });
            continue;
          }
        } else if (typeof val !== rules.type) {
          errors.push({ field, message: `${field} must be a ${rules.type}` });
          continue;
        }
      }

      if (rules.min !== undefined) {
        if (typeof val === 'number' && val < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
        } else if (typeof val === 'string' && val.length < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
        }
      }

      if (rules.max !== undefined) {
        if (typeof val === 'number' && val > rules.max) {
          errors.push({ field, message: `${field} cannot exceed ${rules.max}` });
        } else if (typeof val === 'string' && val.length > rules.max) {
          errors.push({ field, message: `${field} cannot exceed ${rules.max} characters` });
        }
      }

      if (rules.enum && !rules.enum.includes(val)) {
        errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
      }

      if (rules.pattern && typeof val === 'string' && !rules.pattern.test(val)) {
        errors.push({ field, message: rules.message || `${field} format is invalid` });
      }

      if (rules.custom) {
        const res = rules.custom(val);
        if (res !== true) {
          errors.push({ field, message: typeof res === 'string' ? res : `${field} failed validation` });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateBody(schema: SchemaDefinition) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validateSchema(schema, req.body);
    if (!result.valid) {
      return res.status(400).json({
        detail: 'Validation failed',
        errors: result.errors,
      });
    }
    next();
  };
}

export function validateQuery(schema: SchemaDefinition) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validateSchema(schema, req.query);
    if (!result.valid) {
      return res.status(400).json({
        detail: 'Query validation failed',
        errors: result.errors,
      });
    }
    next();
  };
}
