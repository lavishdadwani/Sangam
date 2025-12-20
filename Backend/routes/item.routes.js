import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { createItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems } from "../controllers/item.controller.js"

const itemRouter = express.Router()

itemRouter.post("/create",isAuth,upload.single('image'),createItem)
itemRouter.post("/rating",isAuth,rating)
itemRouter.get("/search-items",isAuth,searchItems)

itemRouter.put("/edit/:itemId",isAuth,upload.single('image'),editItem)
itemRouter.get("/:itemId",isAuth,getItemById)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)
itemRouter.delete("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemsByShop)


export default itemRouter