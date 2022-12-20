import express from "express";
import mongoose from "mongoose";
import HomeDetail from "../models/HomeDetail";
import Home from "../models/Home";
import { Types } from "mongoose";

const connectDB = async () => {
  try {
    // mongodb://localhost:27017/HouseBooking1810
    // mongodb+srv://19130021:node24102022@node2410.uzhfdod.mongodb.net/?retryWrites=true&w=majority
    await mongoose.connect(
      // "mongodb+srv://19130021:node24102022@node2410.uzhfdod.mongodb.net/tmdt"
      "mongodb+srv://19130021:node24102022@node2410.uzhfdod.mongodb.net/tmdt?retryWrites=true&w=majority"
    );
    // Home.aggregate([
    //   {$match: {_id: Types.ObjectId('639d63a814e4f2fe8c1f282f')}},
    //   { $set: { 'folder_image': { $toString: `$_id` }}},  
    //   { $merge: { into: "homes", whenMatched: "replace"} }
    // ]).exec();
    console.log("Connect Successfully !!!");
  } catch (error) {
    console.log("Connect Failed !!!");
  }
};

module.exports = {
  connectDB,
};
