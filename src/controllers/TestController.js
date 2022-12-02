import Order from "../models/Order";
import { Types } from "mongoose";

require("dotenv").config();

  
let getTest = async (req, res, next) => {
  // Home.find({})
  // .populate({path: 'hid', option: {strictPopulate: false}})
  // .limit(6)
  Order
  .aggregate( [
    { $lookup: {
      from: "homes",
      localField: "hid",
      foreignField : "_id",
      as: "home_id"
        }
      },
    { $lookup: {
      from: "facilities",
      localField: "home_id.outstanding_facilities",
      foreignField : "_id",
      as: "outstanding_facilities"
      }
    },
    {
      $group: {
        _id: '$hid',
        homes: { $push: "$$ROOT" }, // add all select * into homes  
        count: { $sum: 1 }
      }
    },
    // { $project : 
    //   { homes: 1, count: 1} 
    // },
    {$sort: {"count": -1}},
    {$limit: 6},
  ])
  .exec(function (err, homes) {
      var result = [];
      homes.forEach(function (home) {
          result.push(home);
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    })
};

module.exports = {
    getTest
  };
  