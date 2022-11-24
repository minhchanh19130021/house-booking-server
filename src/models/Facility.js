import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FacilitySchema = new Schema({
    icon: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true}
});

module.exports = mongoose.model("facilities", FacilitySchema);
