const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const {upload} = require('../config/cloudinary');
const Product = require('../models/Product');
const verifyToken = require('../middleware/auth');

router.get('/', async(req, res) => {
    try {
        await connectDB();
        const products = await Product.find({});
        res.json(products);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
});

router.get('/:id', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({message: 'Produk tidak ditemukan'});
        res.json(product);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/', verifyToken, upload.single('image'), async(req, res) => {
    try {
        const {name, price, description} = req.body;
        const imageUrl = req.file ? req.file.path : '';

        const newProduct = new Product({
            name,
            price,
            description,
            imageUrl: imageUrl
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch(error) {
        console.error('Error POST product:', error);
        res.status(500).json({message: error.message});
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if(!deletedProduct) return res.status(404).json({message: 'Produk tidak ditemukan'});
        res.json({message: 'Produk berhasil dihapus'});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );
        res.json(updatedProduct);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;