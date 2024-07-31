const mongoose = require("mongoose");
const CloseapptimingSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        time: {
            type: String,
        },
        logout_time: {
            type: String,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Closeapp_timing", CloseapptimingSchema);
