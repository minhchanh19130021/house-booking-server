import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    hid: {type: Schema.Types.ObjectId, ref: "homes"},
    uid: {type: Schema.Types.ObjectId, ref: "users"},
    create_date: { type: Date, required: true},
    total_price: {type: Number, required: true},
    is_review: {type: Boolean, required: true}
}, 
{versionKey: false} // Setting the versionKey to false means the document is no longer versioned.
);

module.exports = mongoose.model("orders", OrderSchema);
