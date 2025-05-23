import express, { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getWorkflowExecutions,
  getWorkflowExecution
} from './workflowController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all workflows
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  getWorkflows(req as AuthenticatedRequest, res).catch(next);
});

// Get a specific workflow
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  getWorkflowById(req as AuthenticatedRequest, res).catch(next);
});

// Create a new workflow
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  createWorkflow(req as AuthenticatedRequest, res).catch(next);
});

// Update a workflow
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  updateWorkflow(req as AuthenticatedRequest, res).catch(next);
});

// Delete a workflow
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  deleteWorkflow(req as AuthenticatedRequest, res).catch(next);
});

// Execute a workflow
router.post('/:id/execute', (req: Request, res: Response, next: NextFunction) => {
  executeWorkflow(req as AuthenticatedRequest, res).catch(next);
});

// Get all executions for a workflow
router.get('/:id/executions', (req: Request, res: Response, next: NextFunction) => {
  getWorkflowExecutions(req as AuthenticatedRequest, res).catch(next);
});

// Get a specific execution for a workflow
router.get('/:id/executions/:executionId', (req: Request, res: Response, next: NextFunction) => {
  getWorkflowExecution(req as AuthenticatedRequest, res).catch(next);
});

export default router;
