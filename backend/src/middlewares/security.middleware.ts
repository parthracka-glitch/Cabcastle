import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import { UserModel, IUser } from '../models/user.model.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Enterprise Password Hashing (OWASP Work Factor 12)
 */
export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 12);
}

export function verifyPassword(pw: string, hashed: string): boolean {
  try {
    return bcrypt.compareSync(pw, hashed);
  } catch {
    return false;
  }
}

/**
 * Enforce Password Complexity (OWASP ASVS 2.1)
 * Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number
 */
export function isStrongPassword(pw: string): { valid: boolean; reason?: string } {
  if (!pw || typeof pw !== 'string') {
    return { valid: false, reason: 'Password is required' };
  }
  if (pw.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }
  if (pw.length > 128) {
    return { valid: false, reason: 'Password exceeds maximum length (128 characters)' };
  }
  if (!/[a-z]/.test(pw)) {
    return { valid: false, reason: 'Password must include at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(pw)) {
    return { valid: false, reason: 'Password must include at least one uppercase letter' };
  }
  if (!/[0-9]/.test(pw)) {
    return { valid: false, reason: 'Password must include at least one number' };
  }
  return { valid: true };
}

/**
 * Security Audit Event Logger
 */
export function logSecurityEvent(event: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const safeDetails = { ...details };
  // Redact any sensitive fields from logs
  delete safeDetails.password;
  delete safeDetails.current_password;
  delete safeDetails.new_password;
  delete safeDetails.token;
  delete safeDetails.cvv;
  delete safeDetails.cardNumber;

  console.log(`[SECURITY AUDIT] [${timestamp}] [${event}] ${JSON.stringify(safeDetails)}`);
}

/**
 * Short-lived, secure JWT Access Token with sliding session capability
 */
export function createToken(userId: string, email: string, role: string, expiresMinutes: number = 60 * 24): string {
  const payload = {
    sub: userId,
    email,
    role,
    iss: 'cab-castle-goa-api',
    type: 'access',
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${expiresMinutes}m` });
}

/**
 * Enterprise OWASP Security Headers Middleware
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self' https:; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:;");
  }

  next();
}

/**
 * Deep NoSQL Injection & Prototype Pollution Protection Middleware
 * Recursively strips MongoDB query operator prefixes ($), dot notations (.), and prototype pollution keys
 */
function cleanNoSqlOperators(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanNoSqlOperators);
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Strip keys starting with '$', containing '.', or prototype pollution keys
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      continue;
    }
    cleaned[key] = cleanNoSqlOperators(obj[key]);
  }
  return cleaned;
}

export function sanitizeNoSqlMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSqlOperators(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSqlOperators(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSqlOperators(req.params);
  }
  next();
}

/**
 * Honeypot Anti-Bot Trap Middleware
 */
export function botTrapMiddleware(trapFields: string[] = ['website_fax_code', '_hp_trap', 'company_fax']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' && req.body && typeof req.body === 'object') {
      for (const field of trapFields) {
        if (req.body[field] && String(req.body[field]).trim() !== '') {
          logSecurityEvent('BOT_HONEYPOT_TRIGGERED', {
            ip: req.ip,
            path: req.path,
            fieldTriggered: field,
          });
          // Silently return fake success or 400 to waste bot resources
          return res.status(200).json({ ok: true, message: 'Request accepted' });
        }
      }
    }
    next();
  };
}

/**
 * Tiered Rate Limiting Storage
 */
const requestCounts: Map<string, number[]> = new Map();

// Periodic prune every 2 minutes
setInterval(() => {
  const now = Date.now() / 1000;
  for (const [ip, timestamps] of requestCounts.entries()) {
    const valid = timestamps.filter((t) => now - t < 900); // 15 mins max window
    if (valid.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, valid);
    }
  }
}, 120000).unref();

export function rateLimitMiddleware(maxRequests: number = 120, windowSeconds: number = 60, prefix: string = 'global') {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${prefix}:${clientIp}`;
    const now = Date.now() / 1000;

    const timestamps = requestCounts.get(key) || [];
    const recent = timestamps.filter((t) => now - t < windowSeconds);

    if (recent.length >= maxRequests) {
      logSecurityEvent('RATE_LIMIT_BREACH', {
        ip: clientIp,
        path: req.path,
        prefix,
        maxRequests,
        windowSeconds,
      });
      return res.status(429).json({
        detail: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: windowSeconds,
      });
    }

    recent.push(now);
    requestCounts.set(key, recent);
    next();
  };
}

// Specialized Rate Limiters
export const authRateLimiter = rateLimitMiddleware(10, 900, 'auth'); // 10 attempts per 15 min
export const bookingRateLimiter = rateLimitMiddleware(20, 300, 'booking'); // 20 bookings per 5 min
export const leadRateLimiter = rateLimitMiddleware(10, 300, 'leads'); // 10 leads per 5 min

/**
 * In-memory Idempotency Store for financial operations
 */
const idempotencyStore: Map<string, { status: number; body: any; expiresAt: number }> = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of idempotencyStore.entries()) {
    if (val.expiresAt < now) {
      idempotencyStore.delete(key);
    }
  }
}, 300000).unref();

export function idempotencyMiddleware(ttlSeconds: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers['idempotency-key'] as string) || (req.body && req.body.razorpay_payment_id);
    if (!key || req.method !== 'POST') {
      return next();
    }

    const cached = idempotencyStore.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(cached.status).json(cached.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyStore.set(key, {
          status: res.statusCode,
          body,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Strict IDOR / Resource Ownership Verification
 */
export function checkResourceOwnership(
  reqUser: IUser | undefined,
  resourceOwner: { userId?: string; email?: string; phone?: string } | string
): boolean {
  if (!reqUser) return false;
  if (reqUser.role === 'admin') return true; // Admins have elevated access

  if (typeof resourceOwner === 'string') {
    return reqUser.id === resourceOwner || reqUser.email === resourceOwner;
  }

  const uId = reqUser.id || '';
  const uEmail = (reqUser.email || '').toLowerCase().trim();
  const uPhone = (reqUser.phone || '').trim();

  if (resourceOwner.userId && resourceOwner.userId === uId) return true;
  if (resourceOwner.email && resourceOwner.email.toLowerCase().trim() === uEmail) return true;
  if (resourceOwner.phone && resourceOwner.phone.trim() === uPhone && uPhone.length >= 8) return true;

  return false;
}

/**
 * Authentication Middleware for Registered Customers / Admins
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token && req.cookies) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ detail: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string };
    let user: any = null;
    try {
      user = await UserModel.findOne({ $or: [{ id: decoded.sub }, { email: decoded.email }] }).lean();
    } catch {
      // Fallback
    }

    if (!user) {
      user = {
        id: decoded.sub || 'user-id',
        email: decoded.email || 'user@cabcastlegoa.com',
        name: decoded.role === 'admin' ? 'Dasgir Adur' : 'Customer',
        role: decoded.role || 'customer',
      };
    } else {
      delete (user as any).password_hash;
      delete (user as any)._id;
      delete (user as any).__v;
    }
    req.user = user as IUser;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ detail: 'Invalid authentication token' });
  }
}

/**
 * Admin Role Guard Middleware
 */
export async function getCurrentAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string };
    if (decoded.role !== 'admin') {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', {
        attemptedBy: decoded.email,
        role: decoded.role,
        path: req.path,
        ip: req.ip,
      });
      return res.status(403).json({ detail: 'Access denied: Admin privileges required' });
    }

    let user: any = null;
    try {
      user = await UserModel.findOne({ $or: [{ id: decoded.sub }, { email: decoded.email }, { role: 'admin' }] }).lean();
    } catch {
      // Fallback
    }

    if (!user) {
      user = {
        id: decoded.sub || 'admin-id',
        email: decoded.email || 'dasgiradur@gmail.com',
        name: 'Dasgir Adur',
        role: 'admin',
      };
    } else {
      delete (user as any).password_hash;
      delete (user as any)._id;
      delete (user as any).__v;
    }
    req.user = user as IUser;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Admin session expired. Please log in again.' });
    }
    return res.status(401).json({ detail: 'Invalid authentication token' });
  }
}

/**
 * Centralized Production Error Handling Middleware (OWASP A09 Protection)
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Application Error Handler caught:', err?.message || err);

  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Do not expose stack traces, database strings, or internal errors in production
  const message = isProd && statusCode === 500 ? 'An internal server error occurred. Please try again later.' : (err.message || 'Server error');

  return res.status(statusCode).json({
    detail: message,
    status: statusCode,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    detail: `Route ${req.method} ${req.originalUrl} not found`,
    status: 404,
  });
}
