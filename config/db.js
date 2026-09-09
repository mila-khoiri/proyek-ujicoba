const mongoose = require('mongoose');

const connectDB = async () => {
    if(mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            bufferCommands: false,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB coonection error:', error.message);
    }
};

module.exports = connectDB;