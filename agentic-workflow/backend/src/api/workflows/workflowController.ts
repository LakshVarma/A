import { Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { 
  getAllWorkflows, 
  getWorkflowById as getWorkflowByIdService,
  createWorkflowService,
  updateWorkflowService,
  deleteWorkflowService,
  executeWorkflowService,
  getWorkflowExecutions as getWorkflowExecutionsService,
  getWorkflowExecution as getWorkflowExecutionService
} from '../../services/workflowService';

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.record(z.any()),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      type: z.string().optional(),
    })
  ),
  isActive: z.boolean().optional().default(true),
});

const updateWorkflowSchema = createWorkflowSchema.partial();

const executeWorkflowSchema = z.object({
  input: z.record(z.any()).optional(),
});

// Get all workflows for the authenticated user
export const getWorkflows = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflows = await getAllWorkflows(userId);

    res.status(200).json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};

// Get a specific workflow by ID
export const getWorkflowById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;

    const workflow = await getWorkflowByIdService(workflowId, userId);

    if (!workflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Create a new workflow
export const createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    
    // Validate request body
    const validatedData = createWorkflowSchema.parse(req.body);
    
    // Create the workflow
    const workflow = await createWorkflowService(validatedData, userId);
    
    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err = new Error('Validation error') as AppError;
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Update an existing workflow
export const updateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;
    
    // Validate request body
    const validatedData = updateWorkflowSchema.parse(req.body);
    
    // Check if workflow exists and belongs to user
    const existingWorkflow = await getWorkflowByIdService(workflowId, userId);
    
    if (!existingWorkflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Update the workflow
    const updatedWorkflow = await updateWorkflowService(workflowId, validatedData, userId);
    
    res.status(200).json({
      success: true,
      data: updatedWorkflow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err = new Error('Validation error') as AppError;
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Delete a workflow
export const deleteWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;
    
    // Check if workflow exists and belongs to user
    const existingWorkflow = await getWorkflowByIdService(workflowId, userId);
    
    if (!existingWorkflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Delete the workflow
    await deleteWorkflowService(workflowId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Execute a workflow
export const executeWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;
    
    // Validate request body
    const validatedData = executeWorkflowSchema.parse(req.body);
    
    // Check if workflow exists and belongs to user
    const existingWorkflow = await getWorkflowByIdService(workflowId, userId);
    
    if (!existingWorkflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Execute the workflow
    const execution = await executeWorkflowService(workflowId, validatedData.input || {}, userId);
    
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err = new Error('Validation error') as AppError;
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Get all executions for a workflow
export const getWorkflowExecutions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;
    
    // Check if workflow exists and belongs to user
    const existingWorkflow = await getWorkflowByIdService(workflowId, userId);
    
    if (!existingWorkflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Get workflow executions
    const executions = await getWorkflowExecutionsService(workflowId, userId);
    
    res.status(200).json({
      success: true,
      data: executions,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Get a specific execution for a workflow
export const getWorkflowExecution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.id;
    const executionId = req.params.executionId;
    
    // Check if workflow exists and belongs to user
    const existingWorkflow = await getWorkflowByIdService(workflowId, userId);
    
    if (!existingWorkflow) {
      const error = new Error('Workflow not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Get workflow execution
    const execution = await getWorkflowExecutionService(workflowId, executionId, userId);
    
    if (!execution) {
      const error = new Error('Execution not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};
