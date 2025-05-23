import { Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  registerWebhook,
  deleteWebhook,
  getWebhooksForWorkflow,
  triggerWebhook,
  getAllZapierActions,
  getZapierActionById,
  executeZapierAction,
} from '../../services/zapierService';

// Validation schemas
const registerWebhookSchema = z.object({
  workflowId: z.string(),
  event: z.string(),
  url: z.string().url(),
});

const triggerWebhookSchema = z.object({
  data: z.record(z.any()),
});

const executeActionSchema = z.object({
  parameters: z.record(z.any()),
});

// Register a webhook
export const registerWebhookHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    
    // Validate request body
    const validatedData = registerWebhookSchema.parse(req.body);
    
    // Register the webhook
    const webhook = registerWebhook(
      userId,
      validatedData.workflowId,
      validatedData.event,
      validatedData.url
    );
    
    res.status(201).json({
      success: true,
      data: webhook,
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

// Delete a webhook
export const deleteWebhookHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const webhookId = req.params.id;
    
    // Delete the webhook
    const success = deleteWebhook(webhookId, userId);
    
    if (!success) {
      const error = new Error('Webhook not found or you do not have permission to delete it') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Get webhooks for a workflow
export const getWebhooksHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const workflowId = req.params.workflowId;
    
    // Get webhooks for the workflow
    const webhooks = getWebhooksForWorkflow(workflowId, userId);
    
    res.status(200).json({
      success: true,
      data: webhooks,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Handle a webhook trigger
export const handleTriggerHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const triggerId = req.params.triggerId;
    
    // Validate request body
    const validatedData = triggerWebhookSchema.parse(req.body);
    
    // Trigger the webhook
    const result = await triggerWebhook(triggerId, validatedData.data);
    
    res.status(200).json({
      success: true,
      data: result,
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

// Get all Zapier actions
export const getActionsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get all Zapier actions
    const actions = getAllZapierActions();
    
    res.status(200).json({
      success: true,
      data: actions,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};

// Get a specific Zapier action
export const getActionHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actionId = req.params.actionId;
    
    // Get the Zapier action
    const action = getZapierActionById(actionId);
    
    if (!action) {
      const error = new Error('Zapier action not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: action,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

// Execute a Zapier action
export const executeActionHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const actionId = req.params.actionId;
    
    // Validate request body
    const validatedData = executeActionSchema.parse(req.body);
    
    // Get the Zapier action
    const action = getZapierActionById(actionId);
    
    if (!action) {
      const error = new Error('Zapier action not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Execute the action
    const result = await executeZapierAction(actionId, validatedData.parameters, userId);
    
    res.status(200).json({
      success: true,
      data: result,
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
