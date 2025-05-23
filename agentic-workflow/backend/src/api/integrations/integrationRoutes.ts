import express, { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';
import {
  getIntegrationProviders,
} from './integrationController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all integration providers
router.get('/providers', (req: Request, res: Response, next: NextFunction) => {
  getIntegrationProviders(req as AuthenticatedRequest, res).catch(next);
});

// Placeholder routes - to be implemented
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [],
  });
});

router.post('/', (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    data: { id: 'mock_integration_id' },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: null,
  });
});

export default router;
