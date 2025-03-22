import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true,
      unique: true,
      uppercase: true,
      trim: true 
    },
    description: { 
      type: String 
    },
    discountType: { 
      type: String, 
      enum: ['percentage', 'fixed'], 
      required: true 
    },
    discountValue: { 
      type: Number, 
      required: true,
      min: 0
    },
    minOrderValue: { 
      type: Number, 
      default: 0 
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  {
    timestamps: true
  }
);

voucherSchema.index({ code: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher; 