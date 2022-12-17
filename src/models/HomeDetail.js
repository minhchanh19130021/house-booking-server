import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const HomeDetailSchema = Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        description: { type: String, default: '' },
        minimum_night: { type: Number },
        maximum_night: { type: Number },
        number_review: { type: Number },
        number_living_room: { type: Number },
        number_bedroom: { type: Number },
        number_bed: { type: Number },
        number_bathroom: { type: Number },
        maximum_number_visitor: {
            adult_children: { type: Number, default: 0 },
            baby: { type: Number, default: 0 },
            pet: { type: Number, default: 0 },
        },
        check_in: { type: String },
        check_out: { type: String },
        hid: { type: Schema.Types.ObjectId, ref: 'homes' },
        facilities: [{ type: Schema.Types.ObjectId, ref: 'facilities' }],
        rate: {
            accurate: { type: Number, default: 0 },
            cleanliness: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            experience: { type: Number, default: 0 },
            location: { type: Number, default: 0 },
        },
        image: { type: Array, default: [] },
        regulations: {
            available: [{ type: Schema.Types.ObjectId, ref: 'regulations' }],
            addtion: [{ type: Schema.Types.ObjectId, ref: 'regulations' }],
        },
    },
    { versionKey: false },
);



module.exports = mongoose.model('home_details', HomeDetailSchema);
