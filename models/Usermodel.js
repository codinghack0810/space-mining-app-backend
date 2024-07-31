const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
        },
        email: {
            type: String,
        },
        password: {
            type: String,
        },
        referalcode: {
            type: String,
        },
        OTP: {
            type: String,
        },
        social_login: {
            type: Boolean,
            default: false,
        },
        login_time: {
            type: String,
        },
        accesstoken: {
            type: String,
        },
        verify: {
            type: String,
            default: 0,
        },
        passwordverification: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user", UserSchema);
