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
            area: { type: String },
            link: { type: String },
            number: { type: String, trim: true },
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
        create_date: { type: Date, required: true },
        avatar: { type: String, required: true },
        discount: { type: Number, required: true },
        folder_image: { type: String, required: true }
    },
    { versionKey: false },
);

export default mongoose.model('Home', HouseSchema);
