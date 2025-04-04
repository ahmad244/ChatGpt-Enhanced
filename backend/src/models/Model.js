"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelDB = void 0;
var mongoose_1 = require("mongoose");

var modelSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true, unique: true },
    description: { type: String },
    endpoint: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number },
});

exports.ModelDB = (0, mongoose_1.model)("Model", modelSchema);
