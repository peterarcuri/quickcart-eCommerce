import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // may be null for guest
  guestEmail: { type: String, required: false },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
      quantity: { type: Number, required: true },
    },
  ],

  amount: { type: Number, required: true },

  // Embedded address subdocument
  address: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },

  status: { type: String, required: true, default: "Order Placed" },
  date: { type: Number, required: true },
});

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
