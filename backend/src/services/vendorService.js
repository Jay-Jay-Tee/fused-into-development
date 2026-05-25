import { Vendor } from "../models/Vendor.js";
import { User } from "../models/User.js";
import { VendorPayout } from "../models/VendorPayouts.js";
import { AppError } from "../utils/appError.js";


export const getVendorProfileService = async ({ vendorId }) => {
    const vendor = await Vendor.findById(vendorId)
        .populate("categories", "name slug")
        .select("-commission -addresses")   // exclude sensitive fields
        .lean();

    if (!vendor)
        throw new AppError("Vendor not found", 404);

    return vendor;
};

export const getMyVendorProfileService = async ({ userId }) => {
    const vendor = await Vendor.findOne({ user: userId })
        .populate("categories", "name slug")
        .lean();

    if (!vendor)
        throw new AppError("Vendor profile not found", 404);

    return vendor;
};


// logo and bannerImage are Cloudinary URLs passed in after upload middleware
export const registerVendorService = async ({ userId, vendorData, logo, bannerImage }) => {
    const existingVendor = await Vendor.findOne({ user: userId });

    if (existingVendor)
        throw new AppError("Vendor profile already exists for this user", 400);

    const vendor = await Vendor.create({
        ...vendorData,
        user: userId,
        logo: logo || null,
        bannerImage: bannerImage || null,
        isApproved: false,
    });

    // mark the application as pending on the User document
    await User.findByIdAndUpdate(userId, {
        "vendorApplication.status": "pending",
        "vendorApplication.rejectionNote": null,
    });

    return vendor.toObject();
};

export const updateVendorProfileService = async ({ userId, updateData, logo, bannerImage }) => {
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor)
        throw new AppError("Vendor profile not found", 404);

    Object.assign(vendor, updateData);
    if (logo)        vendor.logo        = logo;
    if (bannerImage) vendor.bannerImage = bannerImage;

    await vendor.save();
    return vendor.toObject();
};

export const approveVendorService = async ({ vendorId }) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor)
        throw new AppError("Vendor not found", 404);

    if (vendor.isApproved)
        throw new AppError("Vendor is already approved", 400);

    vendor.isApproved = true;
    await User.findByIdAndUpdate(vendor.user, {
        role: "vendor",
        "vendorApplication.status": "approved",   // this is missing from approveVendorService
    });
    await vendor.save();

    // Upgrade the user's role so they gain access to vendor-only routes immediately.
    await User.findByIdAndUpdate(vendor.user, { role: "vendor" });

    return { message: "Vendor approved successfully" };
};

export const rejectVendorService = async ({ vendorId, reason }) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor)
        throw new AppError("Vendor not found", 404);
    const userId = vendor.user;

    await Vendor.findByIdAndDelete(vendorId);

    await User.findByIdAndUpdate(userId, {
        "vendorApplication.status": "rejected",
        "vendorApplication.rejectionNote": reason || "No reason provided",
    });

    return { message: "Vendor application rejected" };
};

export const updateVendorCommissionService = async ({ vendorId, commissionPercent }) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor)
        throw new AppError("Vendor not found", 404);

    vendor.commission = commissionPercent;
    await vendor.save();

    return { message: "Commission updated", commission: vendor.commission };
};

export const getApplicationStatusService = async ({ userId }) => {
    const user = await User.findById(userId)
        .select("vendorApplication")
        .lean();

    if (!user)
        throw new AppError("User not found", 404);

    return user.vendorApplication;
};

export const getMyPayoutsService = async ({ userId }) => {
    const vendor = await Vendor.findOne({ user: userId });
    if (!vendor)
        throw new AppError("Vendor profile not found", 404);
    const results = await VendorPayout.find({ vendor: vendor._id })
        .populate("paymentInfo", "amount status transactionId")
        .sort({ year: -1, month: -1 })
        .lean();

    return results;
};