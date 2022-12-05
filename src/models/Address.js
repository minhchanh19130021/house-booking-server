import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  city: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },
  specifically: { type: String, required: true },
});

module.exports = mongoose.model("address", AddressSchema);
