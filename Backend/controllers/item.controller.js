import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const owner = req.userId;
    const shop = await Shop.findOne({ owner });
    if (!shop) {
      return res.error("Shop not found");
    }

    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      shop: shop._id,
      image,
    });
    shop.items.push(item._id)
    await shop.save()
    await (await shop.populate('owner')).populate({
        path:"items",
        options:{sort:{updatedAT:-1}}
    })
    return res.success("Item Created Successfully.", shop);
  } catch (err) {
    return res.error("Got Create Item Error", err);
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, category, foodType, price, image },
      { new: true }
    );
    if (!item) {
      return res.error("Item not found");
    }
    const shop = await Shop.findOne({owner:req.userId}).populate({
        path:"items",
        options:{sort:{updatedAT:-1}}
    })

    return res.success("Item Edited Successfully.", shop);
  } catch (err) {
    return res.error("Got Edit Item  Error", err);
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const item = await Item.findById(itemId)
    if(!item){
        res.error("Item not found");
    }
    return res.success("Item got Successfully.", item);

    

  } catch (err) {
    return res.error("Got get Item Error", err);
    
  }
}

export const deleteItem = async (req, res) => {
    try {
      const itemId = req.params.itemId
      const item = await Item.findById(itemId)
      if(!item){
          res.error("Item not found");
      }

      const shop = await Shop.findOne({owner:req.userId})
      console.log(shop.items)
      shop.items = shop.items.filter( i => i.toString() !== item._id.toString())
      await shop.save()
      await shop.populate({
        path:"items",
        options:{sort:{updatedAT:-1}}
    })
      return res.success("Item deleted Successfully.", shop);
  
    } catch (err) {
      return res.error("Got get Item Error", err);
      
    }
  }


export const getItemByCity = async (req, res) => {
  try {
    const {city} = req.params
    if ( !city) return res.error("City is required");
    const shops = await Shop.find({city:{$regex: new RegExp(`^${city}$`,"i")}})
    if (!shops) return res.error("Shops not found");
    const shopIds = shops.map(shop => shop._id) 
    const items = await Item.find({shop:{$in:shopIds}})
    return res.success("Got item by city Successfully.", items);
  } catch (err) {
    return res.error("Got-> get item by city Error", err);

  }
}