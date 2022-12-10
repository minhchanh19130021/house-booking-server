import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        birthday: { type: String, required: true },
        gender: { type: String, required: true },
        email: { type: String, required: true },
        type: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        address: {
            city: { type: String, required: true },
            district: { type: String, required: true },
            village: { type: String, required: true },
            specifically: { type: String, required: true },
        },
        active: { type: Boolean, required: true, default: false },
        code_active: { type: String },
        refreshToken: { type: String },
    },
    { collection: 'users', versionKey: false },
);

module.exports = mongoose.model('users', UserSchema);
