import { getRecommendations as getRecommendationsFromAI, expandSearchQuery, suggestProductPrice } from '../services/aiService.js';


// ---- POST /api/ai/recommendations ---------
const getProductRecommendations = async (req, res) => {
    const { viewedProducts } = req.body;

    const recommendations = await getRecommendationsFromAI({
        viewedProducts: viewedProducts || [],
        userId: req.user.id
    });

    res.status(200).json({
        success: true,
        data: recommendations
    });
};

// --- POST /api/ai/search ----------------
const expandSearch = async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Query must be a string of at least 3 characters'
        });
    }

    const expandedTerms = await expandSearchQuery(query.trim());

    res.status(200).json({
        success: true,
        data: expandedTerms
    });
};

//---- POST /api/ai/price-suggest ------------------------
const getPriceSuggestion = async (req, res) => {
    const { productName, category } = req.body;

    if (!productName || !category) {
        return res.status(400).json({
            success: false,
            message: 'productName and category are required'
        });
    }

    const suggestion = await suggestProductPrice({
        productName: productName.trim(),
        category,
    });

    // suggestProductPrice returns null if the AI call fails entirely.
    // Surface that as a 503 so the frontend knows to hide the suggestion UI.
    if (!suggestion) {
        return res.status(503).json({
            success: false,
            message: 'Price suggestion unavailable, please set your price manually'
        });
    }

    res.status(200).json({
        success: true,
        data: suggestion
    });
};

export const aiController = {
    getRecommendations: getProductRecommendations,
    expandSearch,
    suggestProductPrice: getPriceSuggestion
};