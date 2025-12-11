import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { UpdateOrderStatus, createOrder, getOrders } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create",isAuth,createOrder)
orderRouter.get("/orders",isAuth,getOrders)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,UpdateOrderStatus)



export default orderRouter