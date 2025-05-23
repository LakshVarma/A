import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define integration providers
export const INTEGRATION_PROVIDERS = {
  GOOGLE: {
    id: "google",
    name: "Google",
    description: "Connect to Google services like Gmail, Drive, and Calendar",
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    scopes: ["email", "profile", "https://www.googleapis.com/auth/drive.readonly"],
  },
  GITHUB: {
    id: "github",
    name: "GitHub",
    description: "Connect to GitHub for code repositories and issues",
    authUrl: "https://github.com/login/oauth/authorize",
    scopes: ["repo", "user"],
  },
  SLACK: {
    id: "slack",
    name: "Slack",
    description: "Connect to Slack for team communication",
    authUrl: "https://slack.com/oauth/authorize",
    scopes: ["chat:write", "channels:read"],
  },
  NOTION: {
    id: "notion",
    name: "Notion",
    description: "Connect to Notion for documents and databases",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    scopes: ["read", "write"],
  },
  ZAPIER: {
    id: "zapier",
    name: "Zapier",
    description: "Connect to thousands of apps through Zapier",
    authUrl: "https://zapier.com/dashboard/auth/oauth/return",
    scopes: ["read", "write"],
  },
};

// Mock user integrations
const userIntegrations: Record<string, any[]> = {};

// Get all integration providers
export const getAllIntegrationProviders = () => {
  return Object.values(INTEGRATION_PROVIDERS);
};

// Get integration provider by ID
export const getIntegrationProviderById = (id: string) => {
  return Object.values(INTEGRATION_PROVIDERS).find(provider => provider.id === id);
};

// Get user integrations
export const getUserIntegrations = (userId: string) => {
  return userIntegrations[userId] || [];
};

// Create a new integration
export const createIntegration = (
  userId: string,
  provider: string,
  credentials: Record<string, any>
) => {
  // Check if provider exists
  const integrationProvider = getIntegrationProviderById(provider);
  
  if (!integrationProvider) {
    throw new Error(`Integration provider '${provider}' not found`);
  }
  
  // Generate a unique ID
  const integrationId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Create the integration
  const integration = {
    id: integrationId,
    userId,
    provider,
    credentials,
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
  
  return integration;
};

// Delete an integration
export const deleteIntegration = (userId: string, integrationId: string) => {
  // Check if user has any integrations
  if (!userIntegrations[userId]) {
    throw new Error('Integration not found');
  }
  
  // Find the integration
  const integrationIndex = userIntegrations[userId].findIndex(i => i.id === integrationId);
  
  if (integrationIndex === -1) {
    throw new Error('Integration not found');
  }
  
  // Remove the integration
  userIntegrations[userId].splice(integrationIndex, 1);
  
  return true;
};

// Generate OAuth URL for a provider
export const generateOAuthUrl = (provider: string, redirectUri: string) => {
  const integrationProvider = getIntegrationProviderById(provider);
  
  if (!integrationProvider) {
    throw new Error(`Integration provider '${provider}' not found`);
  }
  
  // In a real implementation, this would generate a proper OAuth URL with client ID, scopes, etc.
  // For now, we'll just return a mock URL
  return `${integrationProvider.authUrl}?client_id=mock_client_id&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${integrationProvider.scopes.join('%20')}`;
};
