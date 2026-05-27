import { Category } from "../models/Category.js";
import { AppError } from "../utils/appError.js";

export const getActiveCategoriesService = async () => {
    return await Category.find({ isActive: true })
        .select("name slug icon parentCategory")
        .lean();
};

export const getSubcategoriesService = async ({ categoryId }) => {
    const parent = await Category.findById(categoryId).lean();

    if (!parent)
        throw new AppError("Category not found", 404);

    return await Category.find({ parentCategory: categoryId, isActive: true })
        .select("name slug icon")
        .lean();
};