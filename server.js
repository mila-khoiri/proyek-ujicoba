require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server runningon port ${PORT}`);
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});