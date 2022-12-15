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
    // HomeDetail.findOneAndUpdate(
    //   {hid: Types.ObjectId('636ce065825a1cd1940641a2')},
    //   { $set: { 'rates.accurate': 8}}
    //   )
  
    console.log("Connect Successfully !!!");
  } catch (error) {
    console.log("Connect Failed !!!");
  }
};

module.exports = {
  connectDB,
};
