import { Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

// Validation schema for creating an integration
const createIntegrationSchema = z.object({
  provider: z.string(),
  credentials: z.record(z.any()),
});

// Mock integration data
const integrationProviders = [
  {
    id: "google",
    name: "Google",
    description: "Connect to Google services like Gmail, Drive, and Calendar",
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    scopes: ["email", "profile", "https://www.googleapis.com/auth/drive.readonly"],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect to GitHub for code repositories and issues",
    authUrl: "https://github.com/login/oauth/authorize",
    scopes: ["repo", "user"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect to Slack for team communication",
    authUrl: "https://slack.com/oauth/authorize",
    scopes: ["chat:write", "channels:read"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect to Notion for documents and databases",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    scopes: ["read", "write"],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to thousands of apps through Zapier",
    authUrl: "https://zapier.com/dashboard/auth/oauth/return",
    scopes: ["read", "write"],
  },
];

// Mock user integrations
const userIntegrations: Record<string, any[]> = {};

export const getIntegrationProviders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: integrationProviders,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};

export const getUserIntegrations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    
    // Get user integrations or return empty array if none exist
    const integrations = userIntegrations[userId] || [];
    
    res.status(200).json({
      success: true,
      data: integrations,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = 500;
    throw err;
  }
};

export const createIntegration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    
    // Validate request body
    const validatedData = createIntegrationSchema.parse(req.body);
    
    // Check if provider exists
    const provider = integrationProviders.find(p => p.id === validatedData.provider);
    
    if (!provider) {
      const error = new Error('Integration provider not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Generate a unique ID
    const integrationId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the integration
    const integration = {
      id: integrationId,
      userId,
      provider: validatedData.provider,
      credentials: validatedData.credentials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    
    // Initialize user integrations array if it doesn't exist
    if (!userIntegrations[userId]) {
      userIntegrations[userId] = [];
    }
    
    // Save to our mock database
    userIntegrations[userId].push(integration);
    
    res.status(201).json({
      success: true,
      data: integration,
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

export const deleteIntegration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const integrationId = req.params.id;
    
    // Check if user has any integrations
    if (!userIntegrations[userId]) {
      const error = new Error('Integration not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Find the integration
    const integrationIndex = userIntegrations[userId].findIndex(i => i.id === integrationId);
    
    if (integrationIndex === -1) {
      const error = new Error('Integration not found') as AppError;
      error.statusCode = 404;
      throw error;
    }
    
    // Remove the integration
    userIntegrations[userId].splice(integrationIndex, 1);
    
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    const err = error as AppError;
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};
