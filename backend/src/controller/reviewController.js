import {
    createProductReviewService,
    createVendorReviewService,
    getProductReviewsService,
    getVendorReviewsService,
} from "../services/reviewService.js";

const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;
    const data = await createProductReviewService({
        userId: req.user.id,
        productId: req.params.id,
        rating,
        comment,
    });
    return res.status(201).json(data);
};

const createVendorReview = async (req, res) => {
    const { rating, comment } = req.body;
    const data = await createVendorReviewService({
        userId: req.user.id,
        vendorId: req.params.id,
        rating,
        comment,
    });
    return res.status(201).json(data);
};

const getProductReviews = async (req, res) => {
    const data = await getProductReviewsService({ productId: req.params.id });
    return res.status(200).json(data);
};

const getVendorReviews = async (req, res) => {
    const data = await getVendorReviewsService({ vendorId: req.params.id });
    return res.status(200).json(data);
};

export const reviewController = {
    createProductReview,
    createVendorReview,
    getProductReviews,
    getVendorReviews,
};
