import asyncHandler from '../middleware/asyncHandler.js';
import Region from '../models/regionModels.js'



// @desc Create a new region
// @route POST /api/regions
// @access Private/Admin
const createRegion = asyncHandler(async (req, res) => {
    const { 
        name = 'Region sample', 
        baseDeliveryPrice = 0, 
        maxDistance = 0, 
        extraChargePerKm = 0, 
        coordinates = [0,0]
    } = req.body;

    const region = new Region ({
        name,
        baseDeliveryPrice, 
        maxDistance,
        extraChargePerKm,
        location: {
            type: 'Point',
            coordinates
        }
    });

    const createdRegion = await region.save();
    res.status(201).json(createdRegion);
});


// @desc Get all regions
// @route GET /api/regions
// @access Public
const getRegions = asyncHandler(async (req, res) => {
    const regions = await Region.find({});
    res.status(200).json(regions);
});

// @desc Get a region by ID
// @route GET /api/regions/:id
// @access Public
const getRegionById = asyncHandler(async (req, res) => {
    const region = await Region.findById(req.params.id);

    if (region) {
        res.status(200).json(region);
    } else {
        res.status(404);
        throw new Error('Region not found');
    }
});


// @desc Update a region
// @route PUT /api/regions/:id
// @access Private/Admin
const updateRegion = asyncHandler(async (req, res) => {
    const { name, baseDeliveryPrice, maxDistance, extraChargePerKm, coordinates } = req.body;

    const region = await Region.findById(req.params.id);

    if (region) {
        region.name = name || region.name;
        region.baseDeliveryPrice = baseDeliveryPrice || region.baseDeliveryPrice;
        region.maxDistance = maxDistance || region.maxDistance;
        region.extraChargePerKm = extraChargePerKm || region.extraChargePerKm;
        region.location.coordinates = coordinates || region.location.coordinates;

        const updatedRegion = await region.save();
        res.status(200).json(updatedRegion);
    } else {
        res.status(404);
        throw new Error('Region not found');
    }
});

// @desc Delete a region
// @route DELETE /api/regions/:id
// @access Private/Admin
const deleteRegion = asyncHandler(async (req, res) => {
    const region = await Region.findById(req.params.id);

    if (region) {
        await region.remove();
        res.status(200).json({ message: 'Region removed' });
    } else {
        res.status(404);
        throw new Error('Region not found');
    }
});

export {
    createRegion,
    getRegions,
    getRegionById,
    updateRegion,
    deleteRegion,
};
