import mongoose from "mongoose";
const Schema = mongoose.Schema;

const HouseSchema = Schema({
  _id: {type: Schema.Types.ObjectId},
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rate: { type: Number, required: true },
  number_review: { type: Number, required: true },
  status: {type: Boolean, required: true},
  address: {
    city:{type: String, required: true},
    district:{type: String, required: true},
    area:{type: String, required: true},
    link:{type: String, required: true},
    number:{type: String, required: true, trim: true},
  },
  outstanding_facilities: [{type: Schema.Types.ObjectId, ref: "facilities"}],
});

module.exports = mongoose.model("homes", HouseSchema);

