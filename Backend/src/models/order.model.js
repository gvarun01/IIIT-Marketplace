import mongoose from "mongoose";
import bcrypt from "bcrypt";

const OrderSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, required: true },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    hashedOTP: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (this.isModified("hashedOTP")) {
    this.hashedOTP = await bcrypt.hash(this.hashedOTP, 10);
  }
  next();
});

OrderSchema.methods.isOTPCorrect = async function (otp) {
  return await bcrypt.compare(otp, this.hashedOTP);
};

const Order = mongoose.model("Order", OrderSchema);

export default Order;
