import mongoose from "mongoose";

const Schema = mongoose.Schema;
const shopOrderItemsSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item",required:true },
    name: String,
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
    subTotal:{
        type: Number,
        required:true
    },
    shopOrderItems: [shopOrderItemsSchema],
    status:{
        type:String,
        enum:['pending','preparing', 'out for delivery', 'delivered'],
        default:'pending'
    },
    assignment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
        default: null
    },
    assignedDeliveryBoy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
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
      text: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: {
      type: Number,
    },
    shopOrders: [shopOrderSchema],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
