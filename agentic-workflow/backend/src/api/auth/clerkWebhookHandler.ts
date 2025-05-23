import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Clerk webhook handler
export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    // Get the Clerk webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Get the raw body
    const rawBody = await buffer(req);
    
    // Get the Svix headers
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;
    
    // If there are no Svix headers, return 400
    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing Svix headers' });
    }
    
    // Create a new Svix webhook instance with the webhook secret
    const wh = new Webhook(webhookSecret);
    
    // Verify the webhook payload
    let payload;
    try {
      payload = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Handle the webhook based on the event type
    const eventType = payload.type;
    
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(payload.data);
        break;
      case 'user.updated':
        await handleUserUpdated(payload.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(payload.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling Clerk webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle user created event
const handleUserCreated = async (data: any) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, skipping user creation');
      return;
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if user exists:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log(`User ${data.id} already exists in Supabase`);
      return;
    }
    
    // Create user in Supabase
    const { error } = await supabase.from('users').insert([{
      id: data.id,
      email: data.email_addresses?.[0]?.email_address || 'unknown@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        first_name: data.first_name,
        last_name: data.last_name,
        image_url: data.image_url,
      },
    }]);
    
    if (error) {
      console.error('Error creating user in Supabase:', error);
      return;
    }
    
    console.log(`User ${data.id} created in Supabase`);
  } catch (error) {
    console.error('Error handling user created event:', error);
  }
};

// Handle user updated event
const handleUserUpdated = async (data: any) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, skipping user update');
      return;
    }
    
    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        email: data.email_addresses?.[0]?.email_address || 'unknown@example.com',
        updated_at: new Date().toISOString(),
        metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          image_url: data.image_url,
        },
      })
      .eq('id', data.id);
    
    if (error) {
      console.error('Error updating user in Supabase:', error);
      return;
    }
    
    console.log(`User ${data.id} updated in Supabase`);
  } catch (error) {
    console.error('Error handling user updated event:', error);
  }
};

// Handle user deleted event
const handleUserDeleted = async (data: any) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, skipping user deletion');
      return;
    }
    
    // Delete user from Supabase
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', data.id);
    
    if (error) {
      console.error('Error deleting user from Supabase:', error);
      return;
    }
    
    console.log(`User ${data.id} deleted from Supabase`);
  } catch (error) {
    console.error('Error handling user deleted event:', error);
  }
};

// Webhook event type
interface WebhookEvent {
  type: string;
  data: any;
}
