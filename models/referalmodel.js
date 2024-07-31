const mongoose = require("mongoose");
const referalSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
        referalcode: {
            type: String,
            unique: [true, "referalcode must be unique"],
        },
    },
    { timestamps: true, versionKey: false }
);

const Referal = mongoose.model("referal", referalSchema);

const initialReferal = [
    {
        userId: "",
        referalcode: "565992",
    },
];

Referal.insertMany(initialReferal)
    .then(() => {
        console.log("inserted");
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = Referal;
