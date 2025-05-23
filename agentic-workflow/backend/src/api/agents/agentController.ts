import { Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  getAllAgentTypes,
  getAllAgentCapabilities,
  executeAgentTask,
} from '../../services/agentService';
import { getAgentById as getAgentByIdService } from '../../services/agentService';

// Validation schema for executing an agent
const executeAgentSchema = z.object({
  task: z.string(),
  context: z.record(z.any()).optional(),
});

export const getAgents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agents = getAllAgentTypes();

    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};

export const getAgentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.params.id;

    const agent = getAgentByIdService(agentId);

    if (!agent) {
      const error = new Error('Agent not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

export const executeAgent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const agentId = req.params.id;

    // Validate request body
    const validatedData = executeAgentSchema.parse(req.body);

    // Check if agent type exists
    const agent = getAgentByIdService(agentId);

    if (!agent) {
      const error = new Error('Agent not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    try {
      // Execute the agent task
      const result = await executeAgentTask(
        agentId,
        validatedData.task,
        validatedData.context || {}
      );

      res.status(200).json({
        success: true,
        data: {
          ...result,
          metadata: {
            ...result.metadata,
            userId,
          },
        },
      });
    } catch (error) {
      console.error('Error executing agent:', error);
      const err = new Error('Failed to execute agent') as AppError;
      err.statusCode = 500;
      throw err;
    }
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

export const getAgentCapabilities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const capabilities = getAllAgentCapabilities();

    res.status(200).json({
      success: true,
      data: capabilities,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};
