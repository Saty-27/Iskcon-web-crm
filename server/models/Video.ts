import mongoose from 'mongoose';

// Video schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  youtubeUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

export default Video;