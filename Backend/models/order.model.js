import mongoose from "mongoose";

const Schema = mongoose.Schema;
const shopOrderItemsSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    price: Number,
    quantity: Number,
  },
  { timestamps: true }
);
const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTotal: Number,
    shopOrderItems: [],
  },
  { timestamps: true }
);
const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      type: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: {
      type: Number,
    },
    shopOrder: [shopOrderSchema],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
