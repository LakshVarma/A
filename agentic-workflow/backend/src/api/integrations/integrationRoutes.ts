import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import {
  getIntegrationProviders,
} from './integrationController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all integration providers
router.get('/providers', getIntegrationProviders);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    data: { id: 'mock_integration_id' },
  });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: null,
  });
});

export default router;
