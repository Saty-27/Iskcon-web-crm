import mongoose from 'mongoose';

// Donation Category schema
const donationCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  },
  suggestedAmounts: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

const DonationCategory = mongoose.model('DonationCategory', donationCategorySchema);

export default DonationCategory;