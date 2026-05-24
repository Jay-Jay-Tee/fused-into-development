import {
    createRefundService,
    getMyRefundsService,
    getAllRefundsService,
    getRefundByIdService,
    approveRefundService,
    rejectRefundService,
} from "../services/refundService.js";

const raiseRefund = async (req, res) => {
    const { orderId, itemId, reason } = req.body;
    const data = await createRefundService({
        userId: req.user.id,
        orderId,
        itemId,
        reason,
    });
    return res.status(201).json(data);
};

const getAllRefunds = async (req, res) => {
    const data = await getAllRefundsService({ status: req.query.status });
    return res.status(200).json(data);
};

const getBuyerRefunds = async (req, res) => {
    const data = await getMyRefundsService({ userId: req.user.id });
    return res.status(200).json(data);
};

const getRefundById = async (req, res) => {
    const data = await getRefundByIdService({ refundId: req.params.id });
    return res.status(200).json(data);
};

const approveRefund = async (req, res) => {
    const { adminNote } = req.body;
    const data = await approveRefundService({ refundId: req.params.id, adminNote });
    return res.status(200).json(data);
};

const rejectRefund = async (req, res) => {
    const data = await rejectRefundService({ refundId: req.params.id });
    return res.status(200).json(data);
};

export const refundController = {
    raiseRefund,
    getAllRefunds,
    getBuyerRefunds,
    getRefundById,
    approveRefund,
    rejectRefund,
};
