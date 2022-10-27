import express from "express";
import User from "../models/User";
require("dotenv").config();

let getAllUsers = async (req, res, next) => {
  User.find({}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
      userMap[user._id] = user;
    });
    return res.status(200).json({
      success: true,
      data: userMap,
    });
  });
};

let createNewUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing username and password",
    });
  } else {
    try {
      // check user existed
      const user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "Username already in use",
        });
      } else {
        const hashPassword = await argon2.hash(password);
        const newUser = new User({
          username,
          password: hashPassword,
        });
        await newUser.save();
        // return token
        const accessToken = jwt.sign(
          { userId: newUser._id },
          process.env.ACCESS_TOKEN_SECRET
        );
      }
    } catch (error) {}
  }
};
module.exports = {
  getAllUsers,
  createNewUser,
};
