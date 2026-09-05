const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {type: String, required: [true, 'Username wajib diisi'], unique: true},
    password: {type: String, required: [true, 'Password wajib diisi']}
});

module.exports = mongoose.model('User', userSchema);