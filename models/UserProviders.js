import mongoose from 'mongoose';

const userProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    },
    provider: {
      type: String, // Ví dụ: 'google', 'facebook', etc.
      required: true
    },
    providerId: {
      type: String, // Google ID hoặc các provider ID khác
      required: true
    },
  },
  {
    timestamps: true
  }
);

const UserProvider = mongoose.model('UserProvider', userProviderSchema);
export default UserProvider;
