import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Clerk authentication middleware (simplified for development)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // For development, just add mock auth data
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
