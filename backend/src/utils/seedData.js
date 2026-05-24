import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Vendor } from "../models/Vendor.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";


// Inserts demo data for testing
// clears existing seed data first
// Run with: node src/utils/seedData.js
export const seedData = async () => {

    console.log("Clearing existing seed data...");
    await Promise.all([
        User.deleteMany({}),
        Vendor.deleteMany({}),
        Category.deleteMany({}),
        Product.deleteMany({}),
    ]);

// categories
    console.log("Seeding categories...");
    const [electronics, clothing, books] = await Category.insertMany([
        { name: "Electronics", slug: "electronics", isActive: true },
        { name: "Clothing",    slug: "clothing",    isActive: true },
        { name: "Books",       slug: "books",       isActive: true },
    ]);

// users
    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    const [admin, buyer1, vendorUser1, vendorUser2] = await User.insertMany([
        {
            name: "Admin User",
            userName: "admin",
            email: "admin@vendorhub.com",
            phone: "9000000001",
            password: hashedPassword,
            role: "admin",
        },
        {
            name: "Test Buyer",
            userName: "testbuyer",
            email: "buyer@vendorhub.com",
            phone: "9000000002",
            password: hashedPassword,
            role: "buyer",
        },
        {
            name: "Vendor One",
            userName: "vendorone",
            email: "vendor1@vendorhub.com",
            phone: "9000000003",
            password: hashedPassword,
            role: "vendor",
        },
        {
            name: "Vendor Two",
            userName: "vendortwo",
            email: "vendor2@vendorhub.com",
            phone: "9000000004",
            password: hashedPassword,
            role: "vendor",
        },
    ]);
// vendors
    console.log("Seeding vendors...");
    const [vendor1, vendor2] = await Vendor.insertMany([
        {
            user: vendorUser1._id,
            storeName: "TechZone",
            storeDescription: "Your local electronics shop",
            categories: [electronics._id],
            isApproved: true,
            commission: 10,
        },
        {
            user: vendorUser2._id,
            storeName: "BookNook",
            storeDescription: "Books for every reader",
            categories: [books._id, clothing._id],
            isApproved: true,
            commission: 8,
        },
    ]);
// products
    console.log("Seeding products...");
    await Product.insertMany([
        {
            name: "Wireless Mouse",
            description: "Ergonomic wireless mouse with long battery life",
            price: 599,
            stock: 50,
            vendor: vendor1._id,
            category: electronics._id,
            isActive: true,
        },
        {
            name: "USB-C Hub",
            description: "7-in-1 USB-C hub with HDMI and card reader",
            price: 1299,
            stock: 30,
            vendor: vendor1._id,
            category: electronics._id,
            isActive: true,
        },
        {
            name: "Clean Code",
            description: "A handbook of agile software craftsmanship by Robert C. Martin",
            price: 499,
            stock: 20,
            vendor: vendor2._id,
            category: books._id,
            isActive: true,
        },
    ]);

    console.log("Seed complete.");
    console.log("Admin:  admin@vendorhub.com / Password@123");
    console.log("Buyer:  buyer@vendorhub.com / Password@123");
    console.log("Vendor: vendor1@vendorhub.com / Password@123");
};

// Allow running directly: node src/utils/seedData.js
if (process.argv[1].includes("seedData")) {
    const { connectDB } = await import("../config/db.js");
    await connectDB();
    await seedData();
    await mongoose.disconnect();
    process.exit(0);
}