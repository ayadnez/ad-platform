const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetGender: { type: String, required: true },
  location: { type: String, required: true },
  ageGroup: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the file in GridFS
  filename: { type: String, required: true },
  mimetype: { type: String, required: true }
}, { timestamps: true });

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;