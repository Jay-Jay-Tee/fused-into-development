import logo from './logo.png'
import parcel_icon from './parcel_icon.svg'
import upload_area from './upload_area.png'

export const assets = {
    logo,
    parcel_icon,
    upload_area,
}

export const products = [
    {
        _id: 'v_p001',
        name: 'Cotton handloom kurta',
        image: ['https://picsum.photos/seed/v001/300/400'],
        category: 'Clothing',
        price: 1299,
        stock: 24,
    },
    {
        _id: 'v_p002',
        name: 'Brass desk lamp',
        image: ['https://picsum.photos/seed/v002/300/400'],
        category: 'Home',
        price: 2499,
        stock: 3,
    },
    {
        _id: 'v_p003',
        name: 'Leather wallet, slim',
        image: ['https://picsum.photos/seed/v003/300/400'],
        category: 'Accessories',
        price: 1799,
        stock: 31,
    },
    {
        _id: 'v_p004',
        name: 'Ceramic pour-over set',
        image: ['https://picsum.photos/seed/v004/300/400'],
        category: 'Home',
        price: 1899,
        stock: 1,
    },
    {
        _id: 'v_p005',
        name: 'Khadi cotton shirt',
        image: ['https://picsum.photos/seed/v005/300/400'],
        category: 'Clothing',
        price: 1599,
        stock: 18,
    },
]

export const mockOrders = [
    {
        _id: 'o001',
        items: [
            { name: 'Cotton handloom kurta', quantity: 2, size: 'M' },
            { name: 'Leather wallet, slim', quantity: 1, size: 'default' },
        ],
        amount: 4397,
        address: {
            firstName: 'Aarav',
            lastName: 'Mehta',
            street: '142 Indiranagar Cross',
            city: 'Bengaluru',
            state: 'Karnataka',
            country: 'India',
            zipcode: '560038',
            phone: '9876543210',
        },
        paymentMethod: 'COD',
        payment: false,
        date: Date.now() - 86400000,
        status: 'Order Placed',
    },
    {
        _id: 'o002',
        items: [
            { name: 'Brass desk lamp', quantity: 1, size: 'default' },
        ],
        amount: 2548,
        address: {
            firstName: 'Riya',
            lastName: 'Sharma',
            street: '88 Vasant Vihar',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            zipcode: '110057',
            phone: '9123456780',
        },
        paymentMethod: 'Razorpay',
        payment: true,
        date: Date.now() - 172800000,
        status: 'Packing',
    },
    {
        _id: 'o003',
        items: [
            { name: 'Ceramic pour-over set', quantity: 1, size: 'default' },
            { name: 'Khadi cotton shirt', quantity: 1, size: 'L' },
        ],
        amount: 3547,
        address: {
            firstName: 'Karan',
            lastName: 'Iyer',
            street: '12 Adyar Main Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            zipcode: '600020',
            phone: '9988776655',
        },
        paymentMethod: 'Razorpay',
        payment: true,
        date: Date.now() - 259200000,
        status: 'Shipped',
    },
]