import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { AppError } from '../middleware/errorHandler';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock webhooks storage
const webhooks: Record<string, any> = {};

// Register a webhook
export const registerWebhook = (
  userId: string,
  workflowId: string,
  event: string,
  url: string
) => {
  try {
    // Generate a unique ID
    const webhookId = uuidv4();

    // Create the webhook
    const webhook = {
      id: webhookId,
      user_id: userId,
      workflow_id: workflowId,
      event,
      url,
      created_at: new Date().toISOString(),
    };

    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      supabase
        .from('zapier_webhooks')
        .insert([webhook])
        .then(({ error }) => {
          if (error) {
            console.error('Error registering webhook in Supabase:', error);
          }
        });
    }

    // Save to our mock database as fallback
    webhooks[webhookId] = webhook;

    return webhook;
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
};

// Get webhooks for a workflow
export const getWebhooksForWorkflow = async (workflowId: string, userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('zapier_webhooks')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting webhooks from Supabase:', error);
      } else {
        return data || [];
      }
    }

    // Fallback to mock database
    return Object.values(webhooks).filter(
      webhook => webhook.workflow_id === workflowId && webhook.user_id === userId
    );
  } catch (error) {
    console.error('Error getting webhooks for workflow:', error);
    throw error;
  }
};

// Delete a webhook
export const deleteWebhook = async (webhookId: string, userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { error } = await supabase
        .from('zapier_webhooks')
        .delete()
        .eq('id', webhookId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting webhook from Supabase:', error);
      }
    }

    // Also delete from mock database if it exists
    if (webhooks[webhookId]) {
      delete webhooks[webhookId];
    }

    return true;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
};

// Trigger a webhook
export const triggerWebhook = async (triggerId: string, data: any) => {
  try {
    // Find the webhook in Supabase or mock database
    let webhook;

    if (supabaseUrl && supabaseKey) {
      const { data: webhookData, error } = await supabase
        .from('zapier_webhooks')
        .select('*')
        .eq('id', triggerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          webhook = null;
        } else {
          throw new AppError(error.message);
        }
      } else {
        webhook = webhookData;
      }
    }

    // If not found in Supabase, check mock database
    if (!webhook) {
      webhook = webhooks[triggerId];
    }

    if (!webhook) {
      throw new AppError('Webhook not found');
    }

    // Send data to webhook URL
    try {
      const response = await axios.post(webhook.url, {
        trigger_id: triggerId,
        event: webhook.event,
        data,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error('Error sending webhook data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } catch (error) {
    console.error('Error triggering webhook:', error);
    throw error;
  }
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
  params: Record<string, any>,
  userId: string
) => {
  try {
    // Check if action exists
    const action = getZapierActionById(actionId);

    if (!action) {
      throw new AppError(`Zapier action '${actionId}' not found`);
    }

    // Validate required parameters
    const missingParams = Object.entries(action.inputSchema || {})
      .filter(([_, schema]: [string, any]) => schema.required && !params[_])
      .map(([param]: [string, any]) => param);

    if (missingParams.length > 0) {
      throw new AppError(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    // In a real implementation, this would call the Zapier API
    // For now, we'll just return a mock response

    // Log the execution in Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const executionLog = {
        user_id: userId,
        action_id: actionId,
        params,
        timestamp: new Date().toISOString(),
      };

      supabase
        .from('zapier_action_logs')
        .insert([executionLog])
        .then(({ error }) => {
          if (error) {
            console.error('Error logging Zapier action execution:', error);
          }
        });
    }

    return {
      success: true,
      action: actionId,
      params,
      timestamp: new Date().toISOString(),
      result: {
        id: uuidv4(),
        status: 'success',
        message: `Successfully executed ${action.name}`,
      },
    };
  } catch (error) {
    console.error('Error executing Zapier action:', error);
    throw error;
  }
};
