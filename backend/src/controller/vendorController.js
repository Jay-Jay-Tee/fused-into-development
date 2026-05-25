import {
    getVendorProfileService,
    getMyVendorProfileService,
    registerVendorService,
    updateVendorProfileService,
    approveVendorService,
    rejectVendorService,
    getApplicationStatusService,
    updateVendorCommissionService,
} from "../services/vendorService.js";
import { AppError } from "../utils/appError.js";

const getVendorProfile = async (req, res) => {
    const data = await getVendorProfileService({ vendorId: req.params.id });
    return res.status(200).json(data);
};

const getMyVendorProfile = async (req, res) => {
    const data = await getMyVendorProfileService({ userId: req.user.id });
    return res.status(200).json(data);
};

const registerVendor = async (req, res) => {
    const logo        = req.files?.logo?.[0]?.path || null;
    const bannerImage = req.files?.bannerImage?.[0]?.path || null;
    const data = await registerVendorService({
        userId: req.user.id,
        vendorData: req.body,
        logo,
        bannerImage,
    });
    return res.status(201).json(data);
};

const updateVendorProfile = async (req, res) => {
    const logo        = req.files?.logo?.[0]?.path || null;
    const bannerImage = req.files?.bannerImage?.[0]?.path || null;
    const data = await updateVendorProfileService({
        userId: req.user.id,
        updateData: req.body,
        logo,
        bannerImage,
    });
    return res.status(200).json(data);
};

const approveVendor = async (req, res) => {
    const data = await approveVendorService({ vendorId: req.params.id });
    return res.status(200).json(data);
};

const rejectVendor = async (req, res) => {
    const { reason } = req.body;
    const data = await rejectVendorService({ vendorId: req.params.id, reason });
    return res.status(200).json(data);
};

const getApplicationStatus = async (req, res) => {
    const data = await getApplicationStatusService({ userId: req.user.id });
    return res.status(200).json(data);
};

const updateVendorCommission = async (req, res) => {
    const { commissionPercent } = req.body;
    if (Number.isNaN(Number(commissionPercent)))
        throw new AppError("Expected numerical input", 400);
    const data = await updateVendorCommissionService({
        vendorId: req.params.id,
        commissionPercent: Number(commissionPercent),
    });
    return res.status(200).json(data);
};

export const vendorController = {
    getVendorProfile,
    getMyVendorProfile,
    registerVendor,
    updateVendorProfile,
    approveVendor,
    rejectVendor,
    getApplicationStatus,
    updateVendorCommission,
};
