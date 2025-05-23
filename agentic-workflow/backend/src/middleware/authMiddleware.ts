import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/backend';

export const requireAuth = ClerkExpressRequireAuth({});

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    sessionId: string;
    getToken: () => Promise<string>;
  };
}
