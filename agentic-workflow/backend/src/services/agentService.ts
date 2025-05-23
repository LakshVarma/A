import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define agent types
export const AGENT_TYPES = {
  RESEARCH: {
    id: "research",
    name: "Research Agent",
    description: "Finds and summarizes information on a given topic",
    capabilities: ["research", "summarize"],
  },
  CODE: {
    id: "code",
    name: "Code Agent",
    description: "Writes, reviews, and optimizes code",
    capabilities: ["write-code", "review-code", "optimize-code"],
  },
  WRITING: {
    id: "writing",
    name: "Writing Agent",
    description: "Creates and edits written content",
    capabilities: ["write", "edit", "summarize"],
  },
  DATA_ANALYSIS: {
    id: "data_analysis",
    name: "Data Analysis Agent",
    description: "Analyzes data and generates insights",
    capabilities: ["analyze-data", "visualize-data"],
  },
  PLANNING: {
    id: "planning",
    name: "Planning Agent",
    description: "Creates plans and breaks down tasks",
    capabilities: ["plan", "organize"],
  },
};

// Get all agent types
export const getAllAgentTypes = () => {
  return Object.values(AGENT_TYPES);
};

// Get agent by ID
export const getAgentById = (id: string) => {
  return Object.values(AGENT_TYPES).find(agent => agent.id === id);
};

// Get all agent capabilities
export const getAllAgentCapabilities = () => {
  const capabilities = new Set<string>();

  Object.values(AGENT_TYPES).forEach(agent => {
    agent.capabilities.forEach(capability => {
      capabilities.add(capability);
    });
  });

  return Array.from(capabilities);
};

// Execute an agent task using Google AI API
export const executeAgentTask = async (
  agentType: string,
  task: string,
  context: Record<string, any> = {}
) => {
  try {
    const agent = getAgentById(agentType);

    if (!agent) {
      throw new Error(`Agent type '${agentType}' not found`);
    }

    // Check if Google AI API key is available
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('Google AI API key not found in environment variables');
    }

    // Prepare the prompt based on agent type and task
    const prompt = prepareAgentPrompt(agent, task, context);

    // Call Google AI API (Gemini)
    const response = await callGeminiAPI(prompt, apiKey);

    return {
      result: response,
      metadata: {
        agentType,
        task,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error executing agent task:', error);
    throw error;
  }
};

// Prepare a prompt for the agent based on its type and the task
const prepareAgentPrompt = (
  agent: typeof AGENT_TYPES.RESEARCH,
  task: string,
  context: Record<string, any>
) => {
  // Base prompt with agent identity
  let prompt = `You are a ${agent.name}. ${agent.description}\n\n`;

  // Add task description
  prompt += `Task: ${task}\n\n`;

  // Add context if available
  if (Object.keys(context).length > 0) {
    prompt += `Context:\n${JSON.stringify(context, null, 2)}\n\n`;
  }

  // Add specific instructions based on agent type
  switch (agent.id) {
    case AGENT_TYPES.RESEARCH.id:
      prompt += 'Please provide a comprehensive but concise summary of the information. Include key facts, figures, and insights. Cite sources where possible.';
      break;
    case AGENT_TYPES.CODE.id:
      prompt += 'Please provide clean, well-documented code with explanations. Follow best practices and consider edge cases.';
      break;
    case AGENT_TYPES.WRITING.id:
      prompt += 'Please write in a clear, engaging style. Ensure proper grammar, structure, and flow.';
      break;
    case AGENT_TYPES.DATA_ANALYSIS.id:
      prompt += 'Please analyze the data thoroughly. Identify patterns, trends, and insights. Suggest visualizations where appropriate.';
      break;
    case AGENT_TYPES.PLANNING.id:
      prompt += 'Please create a detailed plan with clear steps, timelines, and dependencies. Consider potential obstacles and mitigation strategies.';
      break;
    default:
      prompt += 'Please complete this task to the best of your abilities.';
  }

  return prompt;
};

// Call the Google Gemini API
const callGeminiAPI = async (prompt: string, apiKey: string) => {
  try {
    // Real implementation calling the Google Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if we have a valid response
    if (response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0 &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', response.data);
      return `I couldn't generate a proper response. Please try again.`;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Fallback to mock response in case of error
    return `I'm sorry, I couldn't process your request due to an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
