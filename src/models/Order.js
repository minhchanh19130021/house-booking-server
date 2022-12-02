import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    hid: {type: Schema.Types.ObjectId, ref: "homes"},
    uid: { type: String, required: true },
    create_date: { type: Date, required: true},
    total_price: {type: Number, required: true}
});

module.exports = mongoose.model("orders", OrderSchema);
