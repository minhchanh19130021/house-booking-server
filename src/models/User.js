import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        firstname: { type: String },
        lastname: { type: String },
        birthday: { type: String },
        gender: { type: String },
        email: { type: String },
        type: { type: String },
        username: { type: String },
        email: { type: String },
        password: { type: String },
        created_at: { type: Date, default: Date.now },
        address: {
            city: { type: String },
            district: { type: String },
            village: { type: String },
            specifically: { type: String },
        },
        avatar: { type: String },
        active: { type: Boolean, default: false },
        code_active: { type: String },
        refreshToken: { type: String },
        avatar: { type: String },
        bonus_point: { type: Number},
    },
    { collection: 'users', versionKey: false },
);

module.exports = mongoose.model('users', UserSchema);
