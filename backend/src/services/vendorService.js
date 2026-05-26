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

    const allowed = ['storeName', 'storeDescription', 'phone', 'addresses', 'categories'];
    for (const key of allowed) {
        if (updateData[key] !== undefined) vendor[key] = updateData[key];
    }
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
        "vendorApplication.status": "approved",
    });
    await vendor.save();

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
// Returns approved vendors that have at least one address matching the
// provided city and/or state. At least one of the two must be supplied.
export const getVendorsByAddressService = async ({ city, state }) => {
    if (!city && !state)
        throw new AppError("Provide at least one of: city, state", 400);

    const addressMatch = {};
    if (city)  addressMatch.city  = { $regex: new RegExp(`^${city.trim()}$`,  'i') };
    if (state) addressMatch.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };

    const vendors = await Vendor.find({
        isApproved: true,
        addresses: { $elemMatch: addressMatch },
    })
        .select("-commission -addresses")
        .populate("categories", "name slug")
        .lean();

    return vendors;
};