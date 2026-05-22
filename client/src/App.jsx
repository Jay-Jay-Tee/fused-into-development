import {BrowserRouter,Routes,Route} from "react-router-dom";
//auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VendorRegister from "./pages/auth/VendorRegister";
//buyer
import Home from "./pages/buyer/Home";
import ProductList from "./pages/buyer/ProductList";
import ProductDetail from "./pages/buyer/ProductDetail";
import Cart from "./pages/buyer/Cart";
import Wishlist from "./pages/buyer/Wishlist";
import Checkout from "./pages/buyer/Checkout";
import OrderTracking from "./pages/buyer/OrderTracking";
import OrderHistory from "./pages/buyer/OrderHistory";
//seller
import SellerDashboard from "./pages/seller/SellerDashboard";
import ProductManage from "./pages/seller/ProductManage";
import AddProduct from "./pages/seller/AddProduct";
import EditProduct from "./pages/seller/EditProduct";
import OrderManage from "./pages/seller/OrderManage";
import Earnings from "./pages/seller/Earnings";
//admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import VendorApproval from "./pages/admin/VendorApproval";
import CategoryManage from "./pages/admin/CategoryManage";
import RefundQueue from "./pages/admin/RefundQueue";
import Analytics from "./pages/admin/Analytics";
import CommissionSettings from "./pages/admin/CommissionSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<ProductManage />} />
        <Route path="/seller/products/add" element={<AddProduct />} />
        <Route path="/seller/products/edit/:id" element={<EditProduct />} />
        <Route path="/seller/orders" element={<OrderManage />} />
        <Route path="/seller/earnings" element={<Earnings />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<VendorApproval />} />
        <Route path="/admin/categories" element={<CategoryManage />} />
        <Route path="/admin/refunds" element={<RefundQueue />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/commission" element={<CommissionSettings />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;