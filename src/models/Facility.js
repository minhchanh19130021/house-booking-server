import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FacilitySchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    icon: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true}
});

module.exports = mongoose.model("facilities", FacilitySchema);
