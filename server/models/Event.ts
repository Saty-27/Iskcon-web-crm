import mongoose from 'mongoose';

// Event schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  suggestedAmounts: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;