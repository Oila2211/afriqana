import express from 'express';
const router = express.Router();
import {
    createRegion,
    getRegions,
    getRegionById,
    updateRegion,
    deleteRegion,
} from '../controllers/regionController.js';
import { protect, admin } from '../middleware/authMiddleware.js'


router.route('/')
    .get(getRegions)
    .post(protect, admin, createRegion);

router.route('/:id')
    .get(getRegionById)
    .put(protect, admin, updateRegion)
    .delete(protect, admin, deleteRegion);

export default router;

