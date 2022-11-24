import express from "express";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://19130021:node24102022@node2410.uzhfdod.mongodb.net/tmdt"
    );
    console.log("Connect Successfully !!!");
  } catch (error) {
    console.log("Connect Failed !!!");
  }
};

module.exports = {
  connectDB,
};
