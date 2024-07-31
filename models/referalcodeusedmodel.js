const mongoose = require("mongoose");
const Used_referalSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        referalcode: {
            type: String,
        },
        referedusers: [
            {
                userId: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("usedreferal", Used_referalSchema);
