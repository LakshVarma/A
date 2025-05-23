import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock webhooks storage
const webhooks: Record<string, any> = {};

// Register a webhook
export const registerWebhook = (
  userId: string,
  workflowId: string,
  event: string,
  url: string
) => {
  // Generate a unique ID
  const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Create the webhook
  const webhook = {
    id: webhookId,
    userId,
    workflowId,
    event,
    url,
    createdAt: new Date().toISOString(),
  };
  
  // Save to our mock database
  webhooks[webhookId] = webhook;
  
  return webhook;
};

// Get webhooks for a workflow
export const getWebhooksForWorkflow = (workflowId: string) => {
  return Object.values(webhooks).filter(webhook => webhook.workflowId === workflowId);
};

// Delete a webhook
export const deleteWebhook = (webhookId: string) => {
  if (!webhooks[webhookId]) {
    throw new Error('Webhook not found');
  }
  
  delete webhooks[webhookId];
  
  return true;
};

// Trigger a webhook
export const triggerWebhook = async (
  workflowId: string,
  event: string,
  payload: Record<string, any>
) => {
  // Find webhooks for this workflow and event
  const workflowWebhooks = Object.values(webhooks).filter(
    webhook => webhook.workflowId === workflowId && webhook.event === event
  );
  
  if (workflowWebhooks.length === 0) {
    return [];
  }
  
  // In a real implementation, this would make HTTP requests to the webhook URLs
  // For now, we'll just return the webhooks that would be triggered
  return workflowWebhooks.map(webhook => ({
    webhook,
    success: true,
    timestamp: new Date().toISOString(),
  }));
};

// Define Zapier actions
export const ZAPIER_ACTIONS = {
  SEND_EMAIL: {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send an email via Zapier',
    inputSchema: {
      to: { type: 'string', required: true },
      subject: { type: 'string', required: true },
      body: { type: 'string', required: true },
    },
  },
  CREATE_TASK: {
    id: 'create_task',
    name: 'Create Task',
    description: 'Create a task in a task management app',
    inputSchema: {
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
      dueDate: { type: 'string', required: false },
    },
  },
  POST_MESSAGE: {
    id: 'post_message',
    name: 'Post Message',
    description: 'Post a message to a chat app',
    inputSchema: {
      channel: { type: 'string', required: true },
      message: { type: 'string', required: true },
    },
  },
};

// Get all Zapier actions
export const getAllZapierActions = () => {
  return Object.values(ZAPIER_ACTIONS);
};

// Get Zapier action by ID
export const getZapierActionById = (id: string) => {
  return Object.values(ZAPIER_ACTIONS).find(action => action.id === id);
};

// Execute a Zapier action
export const executeZapierAction = async (
  actionId: string,
  params: Record<string, any>
) => {
  // Check if action exists
  const action = getZapierActionById(actionId);
  
  if (!action) {
    throw new Error(`Zapier action '${actionId}' not found`);
  }
  
  // In a real implementation, this would call the Zapier API
  // For now, we'll just return a mock response
  return {
    success: true,
    action: actionId,
    params,
    timestamp: new Date().toISOString(),
  };
};
