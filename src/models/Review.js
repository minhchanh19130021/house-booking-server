import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ReviewSchema = Schema({
  _id: {type: Schema.Types.ObjectId},
  oid: {type: Schema.Types.ObjectId, ref: 'orders'},
  private_note: { type: String, required: false },
  public_review: { type: String, required: true },
  extra_special: [{type: String, required: false}],
  description: { 
    feel: { type: String, required: false },
    location: { type: String, required: false },
    host: { type: String, required: false },
    accurate: { type: String, required: false },
   },
  rate: {
    cleanliness: {type: Number, required: true},
    communication: {type: Number, required: true},
    location: {type: Number, required: true},
    accurate: {type: Number, required: true},
    experience: {type: Number, required: true}
  },
  create_date: {type: Date, required: true},
  update_date: { type: String, required: false},
}, 
 {versionKey: false} // Setting the versionKey to false means the document is no longer versioned.
);

module.exports = mongoose.model("reviews", ReviewSchema);