import Order from "../models/Order";
import mongoose from "mongoose";

require("dotenv").config();

let getHistoryBooking = async (req, res, next) => {
    Order
    .aggregate( [
    {
        $match: {
            uid: mongoose.Types.ObjectId(req.query.uid)
        }
    },
      { $lookup: {
        from: "homes",
        localField: "hid",
        foreignField : "_id",
        as: "home"
          }
        },
      { $lookup: {
        from: "orders_details",
        localField: "_id",
        foreignField : "oid",
        as: "order_detail"
        }
      },
      { $lookup: {
        from: "vouchers",
        localField: "order_detail.voucher",
        foreignField : "_id",
        as: "voucher"
        }
      },
      { $lookup: {
        from: "users",
        localField: "uid",
        foreignField : "_id",
        as: "user"
        }
      },
        { $project : 
         { create_date: 1, is_review: 1, 'home.name': 1, 'order_detail': 1, 'voucher.name': 1, 'voucher.discount': 1, 'user.firstname': 1, 'user.lastname': 1, 'user.avatar': 1} 
        },
        {$sort: {create_date: -1}}
    ])
    .exec(function (err, histories) {
        var result = [];
        histories.forEach(function (history) {
            result.push(history);
        });
        return res.status(200).json({
          success: true,
          data: result,
        });
      })
};

module.exports = {
    getHistoryBooking,
};
  