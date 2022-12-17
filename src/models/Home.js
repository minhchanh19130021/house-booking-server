import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const HouseSchema = Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        uid: { type: Schema.Types.ObjectId, ref: 'users' },
        name: { type: String },
        price: { type: Number },
        rate: { type: Number, default: 0 },
        number_review: { type: Number, default: 0 },
        status: { type: Boolean, default: true },
        address: {
            city: { type: String },
            district: { type: String },
            village: { type: String },
            specifically: { type: String },
        },
        slug: { type: String },
        segmentation: { type: String },
        discount: { type: Number },
        outstanding_facilities: [{ type: Schema.Types.ObjectId, ref: 'facilities' }],
        create_date: { type: Date, default: new Date() },
        avatar: { type: String, default: '' },
        total_view: { type: Number, default: 0 },
        introduce: { type: String, default: '' },
        folder_image: { type: String },
        create_date: { type: Date, required: true, default: new Date() },
        avatar: { type: String, default: '' },
        discount: { type: Number, default: 0 },
    },
    { versionKey: false },
);

export default mongoose.model('Home', HouseSchema);
