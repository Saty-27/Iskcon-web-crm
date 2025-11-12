import mongoose from 'mongoose';

// Quote schema
const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  source: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;