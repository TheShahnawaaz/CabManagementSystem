import { Router } from 'express';
import { getQRData, validateQR, getCabDetails } from '../controllers/qr.controller';

const router = Router();

/**
 * QR Routes
 * 
 * Public routes (no authentication required)
 * Used by drivers to scan and validate student QR codes
 * Also provides cab details for student view
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

/**
 * @route   GET /api/qr/cab/:allocationId
 * @desc    Get cab details and all co-travelers for student view
 * @access  Public (no auth needed, but payment is checked)
 * @params  allocationId (UUID)
 */
router.get('/qr/cab/:allocationId', getCabDetails);

export default router;

