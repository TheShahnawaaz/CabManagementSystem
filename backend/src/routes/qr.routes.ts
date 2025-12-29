import { Router } from 'express';
import { getQRData, validateQR } from '../controllers/qr.controller';

const router = Router();

/**
 * QR Routes
 * 
 * Public routes (no authentication required)
 * Used by drivers to scan and validate student QR codes
 */

// ====================================
// PUBLIC QR ROUTES
// ====================================

/**
 * @route   GET /api/qr/:allocationId
 * @desc    Get allocation data for QR display on driver scan page
 * @access  Public (no auth needed)
 * @params  allocationId (UUID)
 */
router.get('/qr/:allocationId', getQRData);

/**
 * @route   POST /api/qr/validate
 * @desc    Validate passkey and log journey (boarding)
 * @access  Public (no auth needed)
 * @body    { allocation_id: UUID, passkey: string (4 digits) }
 */
router.post('/qr/validate', validateQR);

export default router;

