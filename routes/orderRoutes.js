const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/', async(req, res) => {
    try {
        const {items, totalAmount} = req.body;

        if(!items || items.length === 0) {
            return res.status(400).json({message: 'Keranjang belanja kosong'});
        }

        for(const item of items) {
            const product = await Product.findById(item.product);
            if(!product) {
                return res.status(400).json({message: `Produk ID ${item.product} tidak ditemukan`});
            }
            if(product.stock < item.quantity) {
                return res.status(400).json({message: `Stok produk ${product.name} tidak mencukupi`});
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new order({items, totalAmount});
        const savedOrder = await order.save();

        res.status(201).json(savedOrder);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;