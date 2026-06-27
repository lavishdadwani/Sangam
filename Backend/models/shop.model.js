import mongoose from "mongoose";

const Schema = mongoose.Schema

const ShopSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    items:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Item",
    }],
    city: {
        type: String,
        require:true
    },
    state: {
        type: String,
        require:true
    },
    address:{
        type: String,
        required: true,
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["pending", "active", "suspended", "rejected"],
        default: "active",
    },
   
},{timestamps:true})

const Shop = mongoose.model('Shop',ShopSchema)

export default Shop