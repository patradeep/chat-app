import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    }
}, {timestamps: true});
const User = mongoose.model('User', UserSchema);
export default User;