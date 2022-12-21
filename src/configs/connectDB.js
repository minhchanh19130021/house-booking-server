import express from "express";
import mongoose from "mongoose";
import HomeDetail from "../models/HomeDetail";
import Home from "../models/Home";
import Cart from '../models/Cart';
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
    // Cart
    // .aggregate([
    //     {$match: { check_in: {
    //       $gte: new Date("2013-10-01T00:00:00.000Z"),
    //       $lte: new Date("2022-12-29T17:00:00.000+00:00"),
    //       }}},
    //     { $set: { 'is_booked': false }},  
    //     { $merge: { into: "carts", whenMatched: "replace"} }
    //   ]).exec((e, o)=>console.log(o));
      
    console.log("Connect Successfully !!!");
  } catch (error) {
    console.log("Connect Failed !!!");
  }
};

module.exports = {
    connectDB,
};
