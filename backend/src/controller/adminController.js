import {
    getAnalyticsService,
    getPendingVendorsService,
    createCategoryService,
    updateCommissionService,
    disbursePayoutService,
    getPayoutsService,
} from "../services/adminService.js";

const getAnalytics = async (req, res) => {
    const data = await getAnalyticsService();
    return res.status(200).json(data);
};

const getPendingVendors = async (req, res) => {
    const data = await getPendingVendorsService();
    return res.status(200).json(data);
};

const addCategory = async (req, res) => {
    const data = await createCategoryService(req.body);
    return res.status(200).json(data);
};

const updateCommission = async (req, res) => {
    const { commissionPercent } = req.body;
    if (Number.isNaN(Number(commissionPercent)))
        throw new TypeError("Expected numerical input");
    const data = await updateCommissionService({ commissionPercent: Number(commissionPercent) });
    return res.status(200).json(data);
};

const disbursePayout = async (req, res) => {
    const { vendorId, month, year } = req.body;
    const data = await disbursePayoutService({ vendorId, month, year });
    return res.status(200).json(data);
};

const getPayouts = async (req, res) => {
    const data = await getPayoutsService({ vendorId: req.query.vendorId, status: req.query.status });
    return res.status(200).json(data);
};

export const adminController = {
    getAnalytics,
    getPendingVendors,
    addCategory,
    updateCommission,
    disbursePayout,
    getPayouts,
};
