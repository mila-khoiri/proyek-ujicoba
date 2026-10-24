if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
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

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server runningon port ${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(async(req, res, next) => {
    if(mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
        } catch(err) {
            console.error('Database connection error:', err);
            return res.status(500).json({error: 'Database connection failed: ' + err.message});
        }
    }
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if(process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

const multer = require('multer');

const storage = multer.diskStorage({});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, res, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetypes = allowedTypes.test(file.mimetype);

        if(mimetypes) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diizinkan!'));
        }
    }
});
module.exports = app;