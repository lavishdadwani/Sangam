import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { UpdateOrderStatus, acceptOrder, createOrder, getCurrentOrder, getDeliveryBoyAssignment, getOrderById, getOrders, getTodayDeliveries, sendDeliveryOtp, verifyDeliveryOtp, verifyPayment } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create",isAuth,createOrder)
orderRouter.post("/verify-payment",isAuth,verifyPayment)

orderRouter.get("/orders",isAuth,getOrders)
orderRouter.get("/get-assignments",isAuth,getDeliveryBoyAssignment)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,UpdateOrderStatus)
orderRouter.get("/order/:orderId",isAuth,getOrderById)
orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder)
orderRouter.get("/current-order",isAuth,getCurrentOrder)
orderRouter.post("/send-delivery-otp",isAuth,sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp",isAuth,verifyDeliveryOtp)
orderRouter.get("/get-today-deliveries",isAuth,getTodayDeliveries)




export default orderRouter