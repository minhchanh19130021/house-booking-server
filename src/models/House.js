import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HouseSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "users" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("houses", HouseSchema);
