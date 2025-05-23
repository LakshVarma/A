import { Request, Response, NextFunction } from 'express';

// Mock auth middleware for development
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Add mock auth data to the request
  (req as AuthenticatedRequest).auth = {
    userId: 'user_123456789',
    sessionId: 'session_123456789',
    getToken: async () => 'mock_token',
  };

  next();
};

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    sessionId: string;
    getToken: () => Promise<string>;
  };
}
