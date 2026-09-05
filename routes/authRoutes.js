const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        console.log('Data diterima server:', req.body);

        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(400).json({message: 'Username dan password wajib diisi!'});
        }

        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(400).json({message: 'Username sudah terdaftar!'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({message: 'Registrasi berhasil! Silakan login.'});
        
    } catch(err) {
        console.error('Error Register:', err);
        return res.status(400).json({message: err.message || 'Terjadi kesalahan server'});
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(400).json({message: 'Username dan password wajib diisi!'});
        }

        const user = await User.findOne({username});
        if(!user) {
            return res.status(401).json({message: 'Username atau password salah'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({message: 'Username atau password salah!'});
        }

        const token = jwt.sign({id: user._id}, 'RAHASIA_KITA', {expiresIn: '1h'});
        return res.json({token});

    } catch(err) {
        console.error('Login Error:', err.message);
        return res.status(400).json({message: err.message});
    }
});

module.exports = router;