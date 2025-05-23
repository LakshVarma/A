import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { initializeDatabase } from './config/db-init';

// Load environment variables
dotenv.config();

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(pino());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
import workflowRoutes from './api/workflows/workflowRoutes';
import agentRoutes from './api/agents/agentRoutes';
import integrationRoutes from './api/integrations/integrationRoutes';
import zapierRoutes from './api/zapier/zapierRoutes';
import authRoutes from './api/auth/authRoutes';
app.use('/api/workflows', workflowRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/zapier', zapierRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Keep-alive endpoint for Render
app.get('/api/keep-alive', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'Service is active'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Agentic Workflow API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
