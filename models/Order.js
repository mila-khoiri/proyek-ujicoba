const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {type: Number, required: true}
        }
    ],
    totalAmount: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Order', orderSchema);