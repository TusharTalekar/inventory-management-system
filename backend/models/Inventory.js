const mongoose = require('mongoose');

// Note: Stock management is primarily handled via the 'quantity' field in Product.js
// This Inventory model is a placeholder to match the folder structure requested.
// In a complex system, this would track location, lot numbers, etc.
const InventorySchema = new mongoose.Schema({
    locationName: {
        type: String,
        required: true,
    },
    lastAuditDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
