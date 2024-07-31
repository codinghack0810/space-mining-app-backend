const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        type: {
            type: String,
        },
        token: {
            type: String,
        },
        from: {
            type: String,
        },
        to: {
            type: String,
        },
        hash: {
            type: String,
        },
        status: {
            type: String,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("transaction", TransactionSchema);
