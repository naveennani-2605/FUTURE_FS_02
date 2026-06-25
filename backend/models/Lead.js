const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  source: { type: String, default: 'Website Contact Form', trim: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Converted'], 
    default: 'New' 
  },
  notes: [noteSchema],
}, { timestamps: true });

leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text', source: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
