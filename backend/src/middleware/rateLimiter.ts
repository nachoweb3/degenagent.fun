import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || 'unknown'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > max) {
      const resetTime = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', resetTime.toString());
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: resetTime
      });
    }

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', (max - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());

    next();
  };
}

// Preset configurations
export const rateLimitPresets = {
  // Strict rate limit for expensive operations
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Moderate rate limit for standard API calls
  moderate: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many requests, please slow down.'
  }),

  // Loose rate limit for read-only operations
  loose: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Rate limit exceeded.'
  }),

  // Per-wallet rate limiting for agent creation
  agentCreation: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 agents per hour per wallet
    message: 'You can only create 5 agents per hour. Please try again later.',
    keyGenerator: (req) => {
      return req.body.creatorWallet || req.ip || 'unknown';
    }
  }),

  // Trading rate limit
  trading: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 trades per minute
    message: 'Trading rate limit exceeded. Please wait before placing more trades.',
    keyGenerator: (req) => {
      return req.body.agentId || req.ip || 'unknown';
    }
  })
};
