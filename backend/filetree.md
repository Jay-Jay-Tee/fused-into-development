# Backend Filetree

```{js}
/backend
│
├── src
│   │
│   ├── config
│   │   ├── db.js                    # MongoDB connection setup (Mongoose)
│   │   ├── razorpay.js             # Razorpay client initialization
│   │   └── cloudinary.js           # Cloudinary configuration
│   │
│   ├── middleware
│   │   ├── auth.js                 # Verifies JWT and attaches user to req
│   │   ├── role.js                 # Restricts routes by user role
│   │   ├── upload.js               # Multer image upload middleware
│   │   ├── error.js                # Global Express error handler
│   │   └── asyncHandler.js         # Wraps async routes to avoid try/catch spam
│   │
│   ├── models
│   │   ├── User.js                 # User auth + common profile fields
│   │   ├── Vendor.js               # Vendor/store-specific information
│   │   ├── Product.js              # Product catalog entries
│   │   ├── Order.js                # Orders and purchased items
│   │   ├── Review.js               # Product reviews and ratings
│   │   ├── Category.js             # Product categories/subcategories
│   │   ├── Refund.js               # Refund requests and statuses
│   │   ├── Cart.js                 # Buyer cart items
│   │   ├── Wishlist.js             # Buyer wishlist items
│   │   ├── DeliveryAgent.js        # Delivery agent specific information   [V2 feat]
│   │   ├── AgentLocation.js        # Location of the agent                 [V2 feat]
│   │   ├── Address.js              # Buyer's saved addresses
│   │   ├── VendorPayouts.js        # Vendor payouts every month
│   │   └── Payment.js              # Payment metadata and transaction refs
│   │
│   │
│   ├── routes
│   │   ├── auth.routes.js          # Login/register/token routes
│   │   ├── product.routes.js       # Product browsing/search CRUD routes
│   │   ├── order.routes.js         # Checkout/order tracking routes
│   │   ├── vendor.routes.js        # Vendor dashboard/product management
│   │   ├── admin.routes.js         # Admin analytics/moderation routes
│   │   ├── review.routes.js        # Review creation and retrieval
│   │   ├── refund.routes.js        # Refund request handling
│   │   ├── delivery.routes.js      # Delivery request handling             [V2 feat]
│   │   └── payment.routes.js       # Razorpay order/payment verification
│   │
│   ├── services
│   │   ├── aiService.js            # Claude/OpenAI recommendation + AI logic
│   │   ├── paymentService.js       # Razorpay business/payment operations
│   │   ├── inventoryService.js     # Stock checks and inventory updates
│   │   ├── recommendationService.js# Recommendation generation logic
│   │   ├── deliveryService.js      # delivery requests and checks logic       [V2 feat]
│   │   └── authService.js          # JWT/token/password helper logic
│   │
│   ├── utils
│   │   ├── paginate.js             # Pagination helper for APIs
│   │   ├── seedData.js             # Inserts demo/mock database data
│   │   ├── generateToken.js        # JWT creation helper
│   │   └── calculateCommission.js  # Vendor/platform commission calculator
│   │
│   ├── app.js                      # Express app + middleware + route mounting
│   └── server.js                   # Starts HTTP server and connects DB
│
├── uploads                         # Temporary/local uploaded images
│
├── .env                            # Environment variables (secret)
├── .env.example                    # Example env structure for teammates
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Exact dependency versions
└── README.md                       # Setup instructions + API overview
```
