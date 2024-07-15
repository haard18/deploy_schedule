const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const processSchema = new Schema({
    processId: String,
    messageId: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const process = mongoose.model("Process", processSchema);

module.exports = process;