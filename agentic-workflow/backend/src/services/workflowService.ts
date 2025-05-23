import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Redis client
const redisUrl = process.env.UPSTASH_REDIS_URL || '';
const redisToken = process.env.UPSTASH_REDIS_TOKEN || '';
const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

// Mock database for development (will be replaced with Supabase)
const mockWorkflows: Record<string, any[]> = {};
const mockExecutions: Record<string, any[]> = {};

// Get all workflows for a user
export const getAllWorkflows = async (userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new AppError(error.message);
      }

      return data || [];
    }

    // Fallback to mock database
    return mockWorkflows[userId] || [];
  } catch (error) {
    console.error('Error getting workflows:', error);
    throw error;
  }
};

// Get a specific workflow by ID
export const getWorkflowById = async (workflowId: string, userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new AppError(error.message);
      }

      return data;
    }

    // Fallback to mock database
    const userWorkflows = mockWorkflows[userId] || [];
    return userWorkflows.find(w => w.id === workflowId) || null;
  } catch (error) {
    console.error('Error getting workflow:', error);
    throw error;
  }
};

// Create a new workflow
export const createWorkflowService = async (workflowData: any, userId: string) => {
  try {
    const workflowId = uuidv4();
    const now = new Date().toISOString();
    
    const workflow = {
      id: workflowId,
      ...workflowData,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflows')
        .insert([workflow])
        .select()
        .single();

      if (error) {
        throw new AppError(error.message);
      }

      return data;
    }

    // Fallback to mock database
    if (!mockWorkflows[userId]) {
      mockWorkflows[userId] = [];
    }
    
    mockWorkflows[userId].push(workflow);
    return workflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

// Update an existing workflow
export const updateWorkflowService = async (workflowId: string, workflowData: any, userId: string) => {
  try {
    const now = new Date().toISOString();
    
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          ...workflowData,
          updated_at: now,
        })
        .eq('id', workflowId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new AppError(error.message);
      }

      return data;
    }

    // Fallback to mock database
    const userWorkflows = mockWorkflows[userId] || [];
    const workflowIndex = userWorkflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new AppError('Workflow not found');
    }
    
    const updatedWorkflow = {
      ...userWorkflows[workflowIndex],
      ...workflowData,
      updated_at: now,
    };
    
    userWorkflows[workflowIndex] = updatedWorkflow;
    return updatedWorkflow;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
};

// Delete a workflow
export const deleteWorkflowService = async (workflowId: string, userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', userId);

      if (error) {
        throw new AppError(error.message);
      }

      return true;
    }

    // Fallback to mock database
    const userWorkflows = mockWorkflows[userId] || [];
    const workflowIndex = userWorkflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new AppError('Workflow not found');
    }
    
    userWorkflows.splice(workflowIndex, 1);
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

// Execute a workflow
export const executeWorkflowService = async (workflowId: string, input: any, userId: string) => {
  try {
    const workflow = await getWorkflowById(workflowId, userId);
    
    if (!workflow) {
      throw new AppError('Workflow not found');
    }
    
    const executionId = uuidv4();
    const now = new Date().toISOString();
    
    const execution = {
      id: executionId,
      workflow_id: workflowId,
      status: 'running',
      started_at: now,
      completed_at: null,
      result: null,
      error: null,
      user_id: userId,
    };
    
    // Store execution in database
    if (supabaseUrl && supabaseKey) {
      const { error } = await supabase
        .from('workflow_executions')
        .insert([execution]);

      if (error) {
        throw new AppError(error.message);
      }
    } else {
      // Fallback to mock database
      if (!mockExecutions[workflowId]) {
        mockExecutions[workflowId] = [];
      }
      
      mockExecutions[workflowId].push(execution);
    }
    
    // Store execution state in Redis
    await redis.set(
      `workflow:${workflowId}:execution:${executionId}:state`,
      JSON.stringify({
        status: 'running',
        input,
        currentNode: null,
        result: {},
      }),
      { ex: 3600 } // Expire after 1 hour
    );
    
    // Start workflow execution in background
    setTimeout(async () => {
      try {
        // Simulate workflow execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update execution status
        const result = { output: `Executed workflow ${workflow.name} with input: ${JSON.stringify(input)}` };
        const completedAt = new Date().toISOString();
        
        // Update execution in database
        if (supabaseUrl && supabaseKey) {
          await supabase
            .from('workflow_executions')
            .update({
              status: 'completed',
              completed_at: completedAt,
              result,
            })
            .eq('id', executionId);
        } else {
          // Update in mock database
          const executions = mockExecutions[workflowId] || [];
          const executionIndex = executions.findIndex(e => e.id === executionId);
          
          if (executionIndex !== -1) {
            executions[executionIndex] = {
              ...executions[executionIndex],
              status: 'completed',
              completed_at: completedAt,
              result,
            };
          }
        }
        
        // Update state in Redis
        await redis.set(
          `workflow:${workflowId}:execution:${executionId}:state`,
          JSON.stringify({
            status: 'completed',
            input,
            currentNode: null,
            result,
          }),
          { ex: 3600 } // Expire after 1 hour
        );
      } catch (error) {
        console.error('Error executing workflow:', error);
        
        // Update execution status to failed
        if (supabaseUrl && supabaseKey) {
          await supabase
            .from('workflow_executions')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', executionId);
        } else {
          // Update in mock database
          const executions = mockExecutions[workflowId] || [];
          const executionIndex = executions.findIndex(e => e.id === executionId);
          
          if (executionIndex !== -1) {
            executions[executionIndex] = {
              ...executions[executionIndex],
              status: 'failed',
              completed_at: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }
        
        // Update state in Redis
        await redis.set(
          `workflow:${workflowId}:execution:${executionId}:state`,
          JSON.stringify({
            status: 'failed',
            input,
            currentNode: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
          { ex: 3600 } // Expire after 1 hour
        );
      }
    }, 0);
    
    return execution;
  } catch (error) {
    console.error('Error starting workflow execution:', error);
    throw error;
  }
};

// Get all executions for a workflow
export const getWorkflowExecutions = async (workflowId: string, userId: string) => {
  try {
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false });

      if (error) {
        throw new AppError(error.message);
      }

      return data || [];
    }

    // Fallback to mock database
    return mockExecutions[workflowId] || [];
  } catch (error) {
    console.error('Error getting workflow executions:', error);
    throw error;
  }
};

// Get a specific execution for a workflow
export const getWorkflowExecution = async (workflowId: string, executionId: string, userId: string) => {
  try {
    let execution;
    
    // Try to use Supabase if configured
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', executionId)
        .eq('workflow_id', workflowId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new AppError(error.message);
      }

      execution = data;
    } else {
      // Fallback to mock database
      const executions = mockExecutions[workflowId] || [];
      execution = executions.find(e => e.id === executionId) || null;
    }
    
    if (!execution) {
      return null;
    }
    
    // Get execution state from Redis
    const state = await redis.get(`workflow:${workflowId}:execution:${executionId}:state`);
    
    return {
      ...execution,
      state: state ? JSON.parse(state as string) : null,
    };
  } catch (error) {
    console.error('Error getting workflow execution:', error);
    throw error;
  }
};
