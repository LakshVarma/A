import express, { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  getAgents,
  getAgentById,
  executeAgent,
  getAgentCapabilities,
} from './agentController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all agents
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  getAgents(req as AuthenticatedRequest, res).catch(next);
});

// Get agent capabilities
router.get('/capabilities', (req: Request, res: Response, next: NextFunction) => {
  getAgentCapabilities(req as AuthenticatedRequest, res).catch(next);
});

// Get a specific agent
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  getAgentById(req as AuthenticatedRequest, res).catch(next);
});

// Execute an agent
router.post('/:id/execute', (req: Request, res: Response, next: NextFunction) => {
  executeAgent(req as AuthenticatedRequest, res).catch(next);
});

export default router;
