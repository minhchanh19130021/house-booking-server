import express from 'express';
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connect Successfully !!!');
    } catch (error) {
        console.log('Connect Failed !!!');
    }
};

module.exports = {
    connectDB,
};
