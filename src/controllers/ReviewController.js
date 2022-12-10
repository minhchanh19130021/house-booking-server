import Review from "../models/Review";
import Order from "../models/Order";
import { Types } from "mongoose";

require("dotenv").config();

let getReview = async (req, res, next) => {
  Review.find({oid: Types.ObjectId(req.query.oid)})
  .exec(function (err, review) { 
      return res.status(200).json({
        success: true,
        data: review,
      });
    })
}
let putAddNewReview = async (req, res, next) => {
    req.body._id = new Types.ObjectId();
    let newReview = new Review(req.body);
    newReview.save(function (err, review) {
        if (err)  {
        return res.status(500).json({
            success: false,
          })
        }
      });
    await Order.findOneAndUpdate(
        {_id: req.body.oid},
        { $set: { is_review: true}}
    )
    return res.status(200).json({
        success: true,
      })
};

module.exports = {
    getReview,
    putAddNewReview,
  };
  