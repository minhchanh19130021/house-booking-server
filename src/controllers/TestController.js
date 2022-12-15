import Home from "../models/Home";
import { Types } from "mongoose";

require("dotenv").config();

let testApi = async (req, res, next) => {
  console.log(req.body.hid);
  await Home.findOneAndUpdate(
    {_id: Types.ObjectId(req.body.hid)}, 
    {$inc: {number_review: 1}})
  return res.status(200).json({
      success: true,
    })
};

module.exports = {
    testApi,
  };
  