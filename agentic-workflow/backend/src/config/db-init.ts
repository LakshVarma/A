import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database
export const initializeDatabase = async () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or key not provided. Skipping database initialization.');
      return;
    }

    console.log('Initializing database...');

    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await supabase.rpc('exec_sql', { sql: statement });
      } catch (error) {
        console.error(`Error executing SQL statement: ${statement}`);
        console.error(error);
      }
    }

    console.log('Database initialization complete.');

    // Seed predefined agents
    await seedAgents();

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Seed predefined agents
const seedAgents = async () => {
  try {
    const agents = [
      {
        id: 'research',
        name: 'Research Agent',
        description: 'Finds and summarizes information on a given topic',
        capabilities: ['research', 'summarize'],
        configuration: {
          model: 'gemini-1.5-flash',
          temperature: 0.2,
          max_tokens: 1000,
        },
      },
      {
        id: 'code',
        name: 'Code Agent',
        description: 'Writes, reviews, and optimizes code',
        capabilities: ['write-code', 'review-code', 'optimize-code'],
        configuration: {
          model: 'gemini-1.0-pro',
          temperature: 0.1,
          max_tokens: 2000,
        },
      },
      {
        id: 'writing',
        name: 'Writing Agent',
        description: 'Creates and edits written content',
        capabilities: ['write', 'edit', 'summarize'],
        configuration: {
          model: 'gemini-1.5-flash',
          temperature: 0.2,
          max_tokens: 1000,
        },
      },
      {
        id: 'data_analysis',
        name: 'Data Analysis Agent',
        description: 'Analyzes data and generates insights',
        capabilities: ['analyze-data', 'visualize-data'],
        configuration: {
          model: 'gemini-1.0-pro',
          temperature: 0.1,
          max_tokens: 2000,
        },
      },
      {
        id: 'planning',
        name: 'Planning Agent',
        description: 'Creates plans and breaks down tasks',
        capabilities: ['plan', 'organize'],
        configuration: {
          model: 'gemini-1.5-flash',
          temperature: 0.2,
          max_tokens: 1000,
        },
      },
    ];

    // Upsert agents
    for (const agent of agents) {
      const { error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'id' });

      if (error) {
        console.error(`Error upserting agent ${agent.id}:`, error);
      }
    }

    console.log('Agents seeded successfully.');
  } catch (error) {
    console.error('Error seeding agents:', error);
  }
};

// Export Supabase client for use in other modules
export { supabase };
