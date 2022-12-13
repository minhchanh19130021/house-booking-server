import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ReviewSchema = Schema({
  _id: {type: Schema.Types.ObjectId},
  name: { type: String, required: true },
  discount: {type: Number, required: true, min: 1, max: 99},
  expire: {type: Date, required: true},
  create_date: {type: Date, required: true},
  used: {type: Boolean, required: true},
  uid: {type: Schema.Types.ObjectId, required: true},
});

module.exports = mongoose.model("reviews", ReviewSchema);