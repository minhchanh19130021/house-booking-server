import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CartSchema = Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        uid: { type: Schema.Types.ObjectId, ref: 'users' },
        hid: {type: Schema.Types.ObjectId, ref: "homes"},
        check_in: { type: Date, required: true },
        checkout: { type: Date, required: true },
        create_date: { type: Date, required: true },
        number_visitor: {
            adult: { type: Number, required: true },
            children: { type: Number, required: true },
            baby: { type: Number, required: true },
            pet: { type: Number, required: true },
        },
        is_booked: { type: Boolean, required: true, default: false },
    },
    { versionKey: false },
);

export default mongoose.model('carts', CartSchema);
