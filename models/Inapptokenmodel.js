const mongoose = require("mongoose");
const InapptokenSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        Inapptokens: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Inapptoken", InapptokenSchema);
