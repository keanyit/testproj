const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    status: { type: String, default: 'pending' },
    photoUrl: { type: String, default: null },
    finalUrl: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
