require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const products = [
    {
        name: "Sepatu Sneaker Casual",
        price: 350000,
        description: "Sepatu ringan dan nyaman cocok untuk aktivitas harian.",
        stock: 10,
        imageUrl: "https://th.bing.com/th/id/OIP.Msfl3R2vyy0R00ocXaFtTwHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
    },
    {
        name: "Ransel Laptop 15 Inch",
        price: 250000,
        description: "Tas punggung tahan air dilengkapi dengan slot laptop.",
        stock: 15,
        imageUrl: "https://th.bing.com/th/id/OIP.vFV2MY2Cvm_Wxxw4nJ6DDwHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
    },
    {
        name: "Jam Tangan Digital Sport",
        price: 180000,
        description: "Jam tangan waterproof dengan fitur stopwatch dan alarm.",
        stock: 8,
        imageUrl: "https://th.bing.com/th/id/OIP.yfCs4q9cqAgkvy552mLWWgHaHa?w=181&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
    }
];

const seedData = async () => {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Dummy Data Produk Berhasil ditambahkan!");
    process.exit();
};

seedData();