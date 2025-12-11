import mongoose from "mongoose";

const Schema = mongoose.Schema

const DeliveryAssignmentSchema = new Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Order",
    },
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Shop",
    },
    shopOrderId:{
        type: mongoose.Schema.Types.ObjectId,
        require:true
    },
    broadcastedTo:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    status: {
        type: String,
        enum: ["broadcasted", "assigned", "completed"],
        default: "broadcasted"
    },
    acceptedAt: {
        type: Date,
    },
   
},{timestamps:true})

const DeliveryAssignment = mongoose.model("deliveryAssignment", DeliveryAssignmentSchema);

export default DeliveryAssignment;