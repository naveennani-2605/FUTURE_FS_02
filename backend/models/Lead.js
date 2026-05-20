const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  source: { type: String, default: 'Website Contact Form' },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Converted'], 
    default: 'New' 
  },
  notes: [noteSchema],
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
