import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { createItem, editItem } from "../controllers/item.controller.js"

const itemRouter = express.Router()

itemRouter.post("/create",isAuth,upload.single('image'),createItem)
itemRouter.put("/edit/:itemId",isAuth,upload.single('image'),editItem)


export default itemRouter