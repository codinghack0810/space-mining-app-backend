const mongoose = require("mongoose");
const ProfileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    userId: {
      type: String,
    },
    Inapptokens: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    referalcode: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Profile", ProfileSchema);
