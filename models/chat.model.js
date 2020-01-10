const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    User: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    content: String
  },
  {
    timestamps: true
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
