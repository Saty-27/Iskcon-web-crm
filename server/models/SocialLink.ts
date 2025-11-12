import mongoose from 'mongoose';

// Social Link schema
const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);

export default SocialLink;