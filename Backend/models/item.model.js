import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    category: {
      type: String,
      enum: [
        "Snacks",
        "main COurse",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others",
      ],
      require: true
    },
    price: {
      type: Number,
      min: 0,      required: true,
    },
    foodType: {
      type: String,
      enum: ['veg', 'non veg'],
      require: true
    },
    rating:{
        average:{type: Number,default:0},
        count:{type: Number,default:0},
    }
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

export default Item;
