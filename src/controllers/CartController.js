import Cart from '../models/Cart';
import mongoose from "mongoose";
import { Types } from "mongoose";

require('dotenv').config();
let getAllCartDetailByUserId = async (req, res, next) => {
    Cart
    .aggregate( [
    {
        $match: {
            uid: mongoose.Types.ObjectId(req.body.uid)
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
        from: "home_details",
        localField: "home._id",
        foreignField : "hid",
        as: "home_detail"
        }
      },
      {
        $project: { _id: 1, check_in: 1, checkout: 1, create_date: 1, number_visitor: 1, is_booked: 1, 'home.name': 1, 'home.price': 1, 'home._id': 1, 'home.number_review': 1, 'home.avatar': 1, 'home.discount': 1, 'home.folder_image': 1, 'home.address': 1, 'home.rate': 1, 'home_detail.description': 1, 'home_detail.maximum_number_visitor': 1,  'home_detail.minimum_night': 1, 'home_detail.maximum_night': 1, 'home_detail.rates.experience': 1},
    },
    ])
    .exec(function (err, carts) {
        var result = [];
        carts.forEach(function (cart) {
            result.push(cart);
        });
        return res.status(200).json({
          success: true,
          data: result,
        });
      })
};

let deleteCartDetail = async (req, res, next) => {
    Cart
    .deleteOne( { _id: mongoose.Types.ObjectId(req.body._id) } )
    .exec(function (err, carts) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
              });
        }
        else {
            return res.status(200).json({
                success: true,
              });
        }
      })
};

let putNewCartDetail = async (req, res, next) => {
  req.body._id = new Types.ObjectId();
  let newCartDetail = new Cart(req.body);
  newCartDetail.save(function (err, cart) {
      if (err)  {
        console.log(err);
      return res.status(500).json({
          success: false,
        })
      }
      else {
        return res.status(200).json({
          success: true,
        })
      }
    });
};

module.exports = {
    getAllCartDetailByUserId,
    deleteCartDetail,
    putNewCartDetail
};
