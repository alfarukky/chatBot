const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userAgent: { type: String, required: true },
  orderSummaries: [{ type: String }], // Store order summaries as strings
});

module.exports = mongoose.model('Session', sessionSchema);
