import mongoose from "mongoose";
const Schema = mongoose.Schema;

const HomeDetailSchema = Schema({
  _id: {type: Schema.Types.ObjectId},
  description: { type: String, required: true },
  minimum_night: { type: Number, required: true },
  maximum_night: { type: Number, required: true },
  number_review: { type: Number, required: true },
  number_living_room: {type: Number, required: true},
  number_bedroom: {type: Number , required: true},
  number_bed: {type: Number, required: true},
  number_bathroom: {type: Number, required: true},
  check_in: { type: String, required: true },
  check_out: { type: String, required: true },
  hid: {type: Schema.Types.ObjectId, ref: "homes"},
  facilities:  [{type: Schema.Types.ObjectId, ref: "facilities"}],
  regulations: [{available: {type: Schema.Types.ObjectId, ref: "regulations"}}, {addtion: {type: String, required: false}}],  
  image: [{type: String, required: false}],
  rates: {
    accurate: { type: Number, required: true },
    cleanliness: { type: Number, required: true },
    communication: { type: Number, required: true },
    experience: { type: Number, required: true },
    location: { type: Number, required: true, trim: true },
},
});

module.exports = mongoose.model("home_details", HomeDetailSchema);

