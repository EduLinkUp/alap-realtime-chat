const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a group name'],
      trim: true,
      maxlength: [50, 'Group name cannot be more than 50 characters']
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
groupSchema.index({ members: 1 });
groupSchema.index({ admin: 1 });

module.exports = mongoose.model('Group', groupSchema);
