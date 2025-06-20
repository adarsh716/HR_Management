const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  resume: {
    type: String, 
    required: true,
  },
  position:{
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['New', 'Scheduled', 'Ongoing', 'Selected', 'Rejected'],
    default: 'New',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);