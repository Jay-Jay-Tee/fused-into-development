import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Vendor } from "../models/Vendor.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Refund } from "../models/Refund.js";
import { Newsletter } from "../models/Newsletter.js";


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
        Order.deleteMany({}),
        Payment.deleteMany({}),
        Refund.deleteMany({}),
        Newsletter.deleteMany({}),
    ]);

// categories
    console.log("Seeding categories...");
    const [clothing, home, accessories] = await Category.insertMany([
        { name: "Clothing",     slug: "clothing",     isActive: true },
        { name: "Home",         slug: "home",         isActive: true },
        { name: "Accessories",  slug: "accessories",  isActive: true },
    ]);

    const [topwear, bottomwear, lighting, kitchen, bags, wallets] = await Category.insertMany([
        { name: "Topwear",    slug: "topwear",    parentCategory: clothing._id,     isActive: true },
        { name: "Bottomwear", slug: "bottomwear", parentCategory: clothing._id,     isActive: true },
        { name: "Lighting",   slug: "lighting",   parentCategory: home._id,         isActive: true },
        { name: "Kitchen",    slug: "kitchen",    parentCategory: home._id,         isActive: true },
        { name: "Bags",       slug: "bags",       parentCategory: accessories._id,  isActive: true },
        { name: "Wallets",    slug: "wallets",    parentCategory: accessories._id,  isActive: true },
    ]);

// users
    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    const [
        adminUser,
        buyer1,
        buyer2,
        vendorUser1,
        vendorUser2,
        vendorUser3,
        vendorUser4,
        vendorUser5,
    ] = await User.insertMany([
        {
            name: "Admin User",
            userName: "admin",
            email: "admin@vendorhub.com",
            phone: "9000000001",
            password: hashedPassword,
            role: "admin",
        },
        {
            name: "Riya Sharma",
            userName: "riyasharma",
            email: "buyer@vendorhub.com",
            phone: "9000000002",
            password: hashedPassword,
            role: "buyer",
        },
        {
            name: "Aarav Mehta",
            userName: "aaravmehta",
            email: "buyer2@vendorhub.com",
            phone: "9000000003",
            password: hashedPassword,
            role: "buyer",
        },
        {
            name: "Aarav Singh",
            userName: "vendorone",
            email: "vendor1@vendorhub.com",
            phone: "9800000001",
            password: hashedPassword,
            role: "vendor",
        },
        {
            name: "Priya Modi",
            userName: "vendortwo",
            email: "vendor2@vendorhub.com",
            phone: "9800000002",
            password: hashedPassword,
            role: "vendor",
        },
        {
            name: "Karthik Iyer",
            userName: "vendorthree",
            email: "vendor3@vendorhub.com",
            phone: "9800000003",
            password: hashedPassword,
            role: "vendor",
        },
        {
            name: "Sunita Rao",
            userName: "vendorfour",
            email: "vendor4@vendorhub.com",
            phone: "9800000004",
            password: hashedPassword,
            role: "vendor",
        },
        {
            name: "Deepak Joshi",
            userName: "vendorfive",
            email: "vendor5@vendorhub.com",
            phone: "9800000005",
            password: hashedPassword,
            role: "vendor",
        },
    ]);

// vendors
    console.log("Seeding vendors...");
    const [vendor1, vendor2, vendor3, vendor4, vendor5] = await Vendor.insertMany([
        {
            user: vendorUser1._id,
            storeName: "Tantuja Studio",
            storeDescription: "Handwoven cotton products. Family-run, three generations.",
            categories: [clothing._id],
            isApproved: true,
            commission: 10,
        },
        {
            user: vendorUser2._id,
            storeName: "Modi Metals",
            storeDescription: "Brass and copper homeware, exporting since 1998.",
            categories: [home._id],
            isApproved: true,
            commission: 10,
        },
        {
            user: vendorUser3._id,
            storeName: "Flax & Folk",
            storeDescription: "Heavyweight linen bags and home textiles.",
            categories: [accessories._id],
            isApproved: true,
            commission: 10,
        },
        {
            user: vendorUser4._id,
            storeName: "Bagru Prints",
            storeDescription: "Block-printed fabrics from Rajasthan.",
            categories: [clothing._id],
            isApproved: true,
            commission: 8,
        },
        {
            user: vendorUser5._id,
            storeName: "Indigo House",
            storeDescription: "Natural indigo dyed home linens and kitchenware.",
            categories: [home._id, accessories._id],
            isApproved: true,
            commission: 8,
        },
    ]);

// products (30 total: 6 per vendor)
    console.log("Seeding products...");
    const products = await Product.insertMany([
        // Tantuja Studio (vendor1) - clothing
        { name: "Handloom cotton kurta",  description: "Natural cotton, machine washable. Loose fit.",           price: 189900, stock: 40, vendor: vendor1._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p01/400/500"] },
        { name: "Khadi linen shirt",       description: "100% khadi linen. Breathable summer wear.",              price: 159900, stock: 25, vendor: vendor1._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p02/400/500"] },
        { name: "Cotton dhoti pants",      description: "Easy-fit dhoti style pants. Natural off-white.",         price: 129900, stock: 30, vendor: vendor1._id, category: bottomwear._id, isActive: true, images: ["https://picsum.photos/seed/p03/400/500"] },
        { name: "Block print dupatta",     description: "Hand block-printed on cotton. 2.5m length.",             price: 89900,  stock: 50, vendor: vendor1._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p04/400/500"] },
        { name: "Kantha stitch jacket",    description: "Reversible kantha stitch jacket. Heritage print.",        price: 349900, stock: 15, vendor: vendor1._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p05/400/500"] },
        { name: "Ikat cotton saree",       description: "Handwoven double ikat cotton. 6.5m with blouse.",        price: 459900, stock: 10, vendor: vendor1._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p06/400/500"] },

        // Modi Metals (vendor2) - home
        { name: "Brass desk lamp",         description: "Adjustable brass arm lamp. Warm vintage look.",          price: 249900, stock: 20, vendor: vendor2._id, category: lighting._id,   isActive: true, images: ["https://picsum.photos/seed/p07/400/500"] },
        { name: "Copper water jug",        description: "Hammered copper jug. 1.5L capacity.",                   price: 159900, stock: 35, vendor: vendor2._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p08/400/500"] },
        { name: "Brass candle holder set", description: "Set of 3 graduated brass holders.",                     price: 119900, stock: 40, vendor: vendor2._id, category: lighting._id,   isActive: true, images: ["https://picsum.photos/seed/p09/400/500"] },
        { name: "Bronze serving bowl",     description: "Heavy bronze kansa bowl. 20cm diameter.",               price: 199900, stock: 18, vendor: vendor2._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p10/400/500"] },
        { name: "Copper spice box",        description: "7-compartment spice box with lid. 25cm.",               price: 89900,  stock: 30, vendor: vendor2._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p11/400/500"] },
        { name: "Brass wall sconce",       description: "Handcrafted wall-mount brass sconce.",                  price: 279900, stock: 12, vendor: vendor2._id, category: lighting._id,   isActive: true, images: ["https://picsum.photos/seed/p12/400/500"] },

        // Flax & Folk (vendor3) - accessories
        { name: "Linen tote bag",          description: "Heavy linen tote. 10L capacity. Natural beige.",        price: 139900, stock: 45, vendor: vendor3._id, category: bags._id,       isActive: true, images: ["https://picsum.photos/seed/p13/400/500"] },
        { name: "Canvas backpack",         description: "Waxed canvas backpack. 25L. Laptop sleeve.",            price: 299900, stock: 20, vendor: vendor3._id, category: bags._id,       isActive: true, images: ["https://picsum.photos/seed/p14/400/500"] },
        { name: "Leather card wallet",     description: "Slim 4-card slot vegetable-tanned wallet.",             price: 99900,  stock: 60, vendor: vendor3._id, category: wallets._id,    isActive: true, images: ["https://picsum.photos/seed/p15/400/500"] },
        { name: "Jute market bag",         description: "Double-lined jute bag. Reinforced handles.",            price: 59900,  stock: 80, vendor: vendor3._id, category: bags._id,       isActive: true, images: ["https://picsum.photos/seed/p16/400/500"] },
        { name: "Bi-fold leather wallet",  description: "Full-grain leather. 8 card slots + cash.",             price: 149900, stock: 35, vendor: vendor3._id, category: wallets._id,    isActive: true, images: ["https://picsum.photos/seed/p17/400/500"] },
        { name: "Woven belt bag",          description: "Cotton and jute woven belt bag. Adjustable.",           price: 119900, stock: 25, vendor: vendor3._id, category: bags._id,       isActive: true, images: ["https://picsum.photos/seed/p18/400/500"] },

        // Bagru Prints (vendor4) - clothing
        { name: "Bagru print kurta",        description: "Natural dye block-print. Mulmul cotton.",              price: 169900, stock: 35, vendor: vendor4._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p19/400/500"] },
        { name: "Dabu print shirt",         description: "Traditional dabu resist-print. Loose fit.",            price: 149900, stock: 28, vendor: vendor4._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p20/400/500"] },
        { name: "Mud-resist print trousers",description: "Mud-resist print cotton trousers. Elastic waist.",     price: 139900, stock: 22, vendor: vendor4._id, category: bottomwear._id, isActive: true, images: ["https://picsum.photos/seed/p21/400/500"] },
        { name: "Ajrakh print shirt",       description: "Authentic ajrakh block-print. Geometric motifs.",      price: 179900, stock: 18, vendor: vendor4._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p22/400/500"] },
        { name: "Block-print scarf",        description: "Cotton voile scarf. 180x70cm. Natural dyes.",          price: 79900,  stock: 55, vendor: vendor4._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p23/400/500"] },
        { name: "Indigo kurta set",         description: "Indigo-dyed kurta and churidar set. Hand-stitched.",   price: 389900, stock: 12, vendor: vendor4._id, category: topwear._id,    isActive: true, images: ["https://picsum.photos/seed/p24/400/500"] },

        // Indigo House (vendor5) - home + accessories
        { name: "Indigo table runner",      description: "Natural indigo linen runner. 180x35cm.",               price: 89900,  stock: 40, vendor: vendor5._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p25/400/500"] },
        { name: "Linen napkin set",         description: "Set of 6 indigo-dyed linen napkins.",                  price: 119900, stock: 30, vendor: vendor5._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p26/400/500"] },
        { name: "Indigo denim tote",        description: "Selvedge denim tote bag. 15L.",                        price: 169900, stock: 25, vendor: vendor5._id, category: bags._id,       isActive: true, images: ["https://picsum.photos/seed/p27/400/500"] },
        { name: "Wabi-sabi ceramic mug",    description: "Hand-thrown ceramic. 300ml. Dishwasher safe.",         price: 69900,  stock: 50, vendor: vendor5._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p28/400/500"] },
        { name: "Shibori throw cushion",    description: "Shibori-dyed linen cushion cover. 45x45cm.",           price: 99900,  stock: 35, vendor: vendor5._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p29/400/500"] },
        { name: "Kantha quilt",             description: "Hand-stitched kantha quilt. Single size. 100% cotton.", price: 599900, stock: 8,  vendor: vendor5._id, category: kitchen._id,    isActive: true, images: ["https://picsum.photos/seed/p30/400/500"] },
    ]);

// orders (10 orders across 2 buyers)
    console.log("Seeding orders...");
    const orderStatuses = ["delivered", "delivered", "delivered", "shipped", "shipped", "confirmed", "confirmed", "pending", "delivered", "cancelled"];
    await Order.insertMany([
        {
            buyer: buyer1._id,
            items: [
                { product: products[0]._id, vendor: vendor1._id, name: products[0].name, quantity: 1, price: products[0].price },
                { product: products[1]._id, vendor: vendor1._id, name: products[1].name, quantity: 2, price: products[1].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[0],
            subtotal: products[0].price + products[1].price * 2,
            deliveryFee: 0,
            totalAmount: products[0].price + products[1].price * 2,
        },
        {
            buyer: buyer1._id,
            items: [
                { product: products[6]._id, vendor: vendor2._id, name: products[6].name, quantity: 1, price: products[6].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[1],
            subtotal: products[6].price,
            deliveryFee: 4900,
            totalAmount: products[6].price + 4900,
        },
        {
            buyer: buyer1._id,
            items: [
                { product: products[12]._id, vendor: vendor3._id, name: products[12].name, quantity: 1, price: products[12].price },
                { product: products[14]._id, vendor: vendor3._id, name: products[14].name, quantity: 1, price: products[14].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[2],
            subtotal: products[12].price + products[14].price,
            deliveryFee: 0,
            totalAmount: products[12].price + products[14].price,
        },
        {
            buyer: buyer2._id,
            items: [
                { product: products[18]._id, vendor: vendor4._id, name: products[18].name, quantity: 2, price: products[18].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer2", street: "45 Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002", country: "India", phone: "9876543211" },
            orderStatus: orderStatuses[3],
            subtotal: products[18].price * 2,
            deliveryFee: 4900,
            totalAmount: products[18].price * 2 + 4900,
        },
        {
            buyer: buyer2._id,
            items: [
                { product: products[24]._id, vendor: vendor5._id, name: products[24].name, quantity: 1, price: products[24].price },
                { product: products[25]._id, vendor: vendor5._id, name: products[25].name, quantity: 1, price: products[25].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer2", street: "45 Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002", country: "India", phone: "9876543211" },
            orderStatus: orderStatuses[4],
            subtotal: products[24].price + products[25].price,
            deliveryFee: 0,
            totalAmount: products[24].price + products[25].price,
        },
        {
            buyer: buyer1._id,
            items: [
                { product: products[3]._id, vendor: vendor1._id, name: products[3].name, quantity: 3, price: products[3].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[5],
            subtotal: products[3].price * 3,
            deliveryFee: 0,
            totalAmount: products[3].price * 3,
        },
        {
            buyer: buyer2._id,
            items: [
                { product: products[9]._id, vendor: vendor2._id, name: products[9].name, quantity: 1, price: products[9].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer2", street: "45 Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002", country: "India", phone: "9876543211" },
            orderStatus: orderStatuses[6],
            subtotal: products[9].price,
            deliveryFee: 4900,
            totalAmount: products[9].price + 4900,
        },
        {
            buyer: buyer1._id,
            items: [
                { product: products[28]._id, vendor: vendor5._id, name: products[28].name, quantity: 2, price: products[28].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[7],
            subtotal: products[28].price * 2,
            deliveryFee: 4900,
            totalAmount: products[28].price * 2 + 4900,
        },
        {
            buyer: buyer2._id,
            items: [
                { product: products[13]._id, vendor: vendor3._id, name: products[13].name, quantity: 1, price: products[13].price },
                { product: products[15]._id, vendor: vendor3._id, name: products[15].name, quantity: 2, price: products[15].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer2", street: "45 Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002", country: "India", phone: "9876543211" },
            orderStatus: orderStatuses[8],
            subtotal: products[13].price + products[15].price * 2,
            deliveryFee: 0,
            totalAmount: products[13].price + products[15].price * 2,
        },
        {
            buyer: buyer1._id,
            items: [
                { product: products[22]._id, vendor: vendor4._id, name: products[22].name, quantity: 1, price: products[22].price },
            ],
            shippingAddress: { firstName: "Test", lastName: "Buyer", street: "12 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India", phone: "9876543210" },
            orderStatus: orderStatuses[9],
            subtotal: products[22].price,
            deliveryFee: 4900,
            totalAmount: products[22].price + 4900,
        },
    ]);

    console.log("Seed complete.");
    console.log("Admin:   admin@vendorhub.com   / Password@123");
    console.log("Buyer:   buyer@vendorhub.com   / Password@123");
    console.log("Buyer2:  buyer2@vendorhub.com  / Password@123");
    console.log("Vendor1: vendor1@vendorhub.com / Password@123");
    console.log("Vendor2: vendor2@vendorhub.com / Password@123");
    console.log("Vendor3: vendor3@vendorhub.com / Password@123");
    console.log("Vendor4: vendor4@vendorhub.com / Password@123");
    console.log("Vendor5: vendor5@vendorhub.com / Password@123");
};

// Allow running directly: node src/utils/seedData.js
if (process.argv[1].includes("seedData")) {
    const { default: dotenv } = await import("dotenv");
    dotenv.config();
    const { connectDB } = await import("../config/db.js");
    await connectDB();
    await seedData();
    await mongoose.disconnect();
    process.exit(0);
}
