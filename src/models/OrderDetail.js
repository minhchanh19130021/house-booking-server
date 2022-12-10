import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    oid: {type: Schema.Types.ObjectId},
    payment_method: { type: String, required: true },
    checkin: { type: Date, required: true},
    checkout: {type: Date, required: true},
    price: {type: Number, required: true},
    voucher: [{type: Schema.Types.ObjectId, ref: "vouchers"}],
    number_visitor: {type: Object, required: true},
},
{versionKey: false} // Setting the versionKey to false means the document is no longer versioned.
);

module.exports = mongoose.model("orders_details", OrderDetailSchema);
