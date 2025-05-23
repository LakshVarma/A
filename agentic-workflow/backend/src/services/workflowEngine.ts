import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { executeAgentAction } from './agentService';

// Initialize Redis client
const redisUrl = process.env.UPSTASH_REDIS_URL || '';
const redisToken = process.env.UPSTASH_REDIS_TOKEN || '';
const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Workflow execution states
export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowExecutionState {
  status: WorkflowExecutionStatus;
  currentNodeId: string | null;
  input: Record<string, any>;
  output: Record<string, any>;
  nodeResults: Record<string, any>;
  error?: string;
}

// Execute a workflow
export const executeWorkflow = async (
  workflowId: string,
  input: Record<string, any>,
  userId: string
): Promise<string> => {
  try {
    // Get workflow definition
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (error || !workflow) {
      throw new Error(`Workflow not found: ${error?.message || 'Unknown error'}`);
    }

    // Create execution record
    const executionId = uuidv4();
    const now = new Date().toISOString();

    const execution = {
      id: executionId,
      workflow_id: workflowId,
      user_id: userId,
      status: 'pending' as WorkflowExecutionStatus,
      started_at: now,
      input,
    };

    // Save execution to database
    await supabase.from('workflow_executions').insert([execution]);

    // Initialize execution state
    const initialState: WorkflowExecutionState = {
      status: 'pending',
      currentNodeId: null,
      input,
      output: {},
      nodeResults: {},
    };

    // Save state to Redis
    await redis.set(
      `workflow:${workflowId}:execution:${executionId}:state`,
      JSON.stringify(initialState),
      { ex: 3600 } // Expire after 1 hour
    );

    // Start workflow execution in background
    setTimeout(() => runWorkflow(workflowId, executionId, workflow, userId), 0);

    return executionId;
  } catch (error) {
    console.error('Error starting workflow execution:', error);
    throw error;
  }
};

// Run the workflow
const runWorkflow = async (
  workflowId: string,
  executionId: string,
  workflow: any,
  userId: string
) => {
  try {
    // Update execution status to running
    await supabase
      .from('workflow_executions')
      .update({ status: 'running' })
      .eq('id', executionId);

    // Get initial state
    const stateStr = await redis.get(`workflow:${workflowId}:execution:${executionId}:state`);
    if (!stateStr) {
      throw new Error('Execution state not found');
    }

    let state: WorkflowExecutionState = JSON.parse(stateStr as string);
    state.status = 'running';

    // Find trigger node (entry point)
    const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }

    // Start execution from trigger node
    state.currentNodeId = triggerNode.id;
    await updateExecutionState(workflowId, executionId, state);

    // Process the workflow
    const result = await processNode(triggerNode.id, state.input, workflow, state, workflowId, executionId, userId);

    // Update final state
    state.status = 'completed';
    state.output = result;
    await updateExecutionState(workflowId, executionId, state);

    // Update execution record
    await supabase
      .from('workflow_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result,
      })
      .eq('id', executionId);

  } catch (error) {
    console.error('Error executing workflow:', error);

    // Update state to failed
    const stateStr = await redis.get(`workflow:${workflowId}:execution:${executionId}:state`);
    if (stateStr) {
      const state: WorkflowExecutionState = JSON.parse(stateStr as string);
      state.status = 'failed';
      state.error = error instanceof Error ? error.message : 'Unknown error';
      await updateExecutionState(workflowId, executionId, state);
    }

    // Update execution record
    await supabase
      .from('workflow_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', executionId);
  }
};

// Process a node
const processNode = async (
  nodeId: string,
  input: any,
  workflow: any,
  state: WorkflowExecutionState,
  workflowId: string,
  executionId: string,
  userId: string
): Promise<any> => {
  // Find the node
  const node = workflow.nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Update current node in state
  state.currentNodeId = nodeId;
  await updateExecutionState(workflowId, executionId, state);

  // Process node based on type
  let result;
  switch (node.type) {
    case 'trigger':
      // Trigger node just passes input through
      result = input;
      break;

    case 'agent':
      // Execute agent action
      result = await executeAgentAction(node.data.agentId, node.data.prompt, input, userId);
      break;

    case 'condition':
      // Evaluate condition
      const conditionResult = evaluateCondition(node.data.condition, input);
      
      // Find the next node based on condition result
      const edges = workflow.edges.filter((edge: any) => edge.source === nodeId);
      const nextEdge = edges.find((edge: any) => 
        (conditionResult && edge.sourceHandle === 'true') || 
        (!conditionResult && edge.sourceHandle === 'false')
      );
      
      if (!nextEdge) {
        throw new Error(`No edge found for condition result: ${conditionResult}`);
      }
      
      // Process the next node
      result = await processNode(
        nextEdge.target,
        input,
        workflow,
        state,
        workflowId,
        executionId,
        userId
      );
      break;

    case 'transform':
      // Transform the input
      result = transformData(node.data.transformType, node.data.code, input);
      break;

    case 'output':
      // Format the output
      result = formatOutput(node.data.format, node.data.template, input);
      break;

    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }

  // Store node result
  state.nodeResults[nodeId] = result;
  await updateExecutionState(workflowId, executionId, state);

  // Find outgoing edges
  const edges = workflow.edges.filter((edge: any) => edge.source === nodeId);
  
  // If this is an output node or there are no outgoing edges, return the result
  if (node.type === 'output' || edges.length === 0) {
    return result;
  }

  // Process next node
  const nextNodeId = edges[0].target;
  return processNode(nextNodeId, result, workflow, state, workflowId, executionId, userId);
};

// Update execution state in Redis
const updateExecutionState = async (
  workflowId: string,
  executionId: string,
  state: WorkflowExecutionState
): Promise<void> => {
  await redis.set(
    `workflow:${workflowId}:execution:${executionId}:state`,
    JSON.stringify(state),
    { ex: 3600 } // Expire after 1 hour
  );
};

// Evaluate a condition
const evaluateCondition = (condition: string, input: any): boolean => {
  try {
    // Create a safe evaluation context
    const context = { input, result: false };
    
    // Evaluate the condition
    const fn = new Function('input', `
      try {
        return ${condition};
      } catch (error) {
        console.error('Error evaluating condition:', error);
        return false;
      }
    `);
    
    return fn(input);
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

// Transform data
const transformData = (transformType: string, code: string, input: any): any => {
  try {
    // Create a safe evaluation context
    const context = { input, result: null };
    
    // Evaluate the transform code
    const fn = new Function('input', `
      try {
        ${code}
      } catch (error) {
        console.error('Error transforming data:', error);
        return input;
      }
    `);
    
    return fn(input);
  } catch (error) {
    console.error('Error transforming data:', error);
    return input;
  }
};

// Format output
const formatOutput = (format: string, template: string | undefined, input: any): any => {
  try {
    switch (format) {
      case 'json':
        return input;
      
      case 'text':
        if (!template) return JSON.stringify(input);
        
        // Replace placeholders in template
        return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
          const value = path.split('.').reduce((obj: any, key: string) => 
            obj && obj[key] !== undefined ? obj[key] : undefined, input);
          return value !== undefined ? String(value) : match;
        });
      
      case 'html':
        if (!template) return `<pre>${JSON.stringify(input, null, 2)}</pre>`;
        
        // Replace placeholders in template
        return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
          const value = path.split('.').reduce((obj: any, key: string) => 
            obj && obj[key] !== undefined ? obj[key] : undefined, input);
          return value !== undefined ? String(value) : match;
        });
      
      default:
        return input;
    }
  } catch (error) {
    console.error('Error formatting output:', error);
    return input;
  }
};
