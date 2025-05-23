import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
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
router.get('/', getWorkflows);

// Get a specific workflow
router.get('/:id', getWorkflowById);

// Create a new workflow
router.post('/', createWorkflow);

// Update a workflow
router.put('/:id', updateWorkflow);

// Delete a workflow
router.delete('/:id', deleteWorkflow);

// Execute a workflow
router.post('/:id/execute', executeWorkflow);

// Get all executions for a workflow
router.get('/:id/executions', getWorkflowExecutions);

// Get a specific execution for a workflow
router.get('/:id/executions/:executionId', getWorkflowExecution);

export default router;
