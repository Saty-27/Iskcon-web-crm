import mongoose from 'mongoose';

// Donation schema
const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationCategory'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  amount: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  panCard: {
    type: String
  },
  message: {
    type: String
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;