import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
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
router.get('/', getAgents);

// Get agent capabilities
router.get('/capabilities', getAgentCapabilities);

// Get a specific agent
router.get('/:id', getAgentById);

// Execute an agent
router.post('/:id/execute', executeAgent);

export default router;
