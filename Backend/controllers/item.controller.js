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
        options:{sort:{updatedAt:-1}}
    })
    return res.success("Item created successfully.", shop);
  } catch (err) {
        return res.error("Error while creating item", err);
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
        options:{sort:{updatedAt:-1}}
    })

    return res.success("Item updated successfully.", shop);
  } catch (err) {
    return res.error("Error while updating item", err);
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const item = await Item.findById(itemId)
    if(!item){
        return res.error("Item not found");
    }
    return res.success("Item retrieved successfully.", item);

    

  } catch (err) {
    return res.error("Error while retrieving item", err);
    
  }
}

export const deleteItem = async (req, res) => {
    try {
      const itemId = req.params.itemId
      const item = await Item.findById(itemId)
      if(!item){
          return res.error("Item not found");
      }

      const shop = await Shop.findOne({owner:req.userId})
      console.log(shop.items)
      shop.items = shop.items.filter( i => i.toString() !== item._id.toString())
      await shop.save()
      await shop.populate({
        path:"items",
        options:{sort:{updatedAt:-1}}
    })
      return res.success("Item deleted successfully.", shop);
  
    } catch (err) {
      return res.error("Error while retrieving item", err);
      
    }
  }


export const getItemByCity = async (req, res) => {
  try {
    const {city} = req.params
    if (!city) return res.error("City is required.");
    const shops = await Shop.find({city:{$regex: new RegExp(`^${city}$`,"i")}})
    if (!shops || shops.length === 0) return res.error("Shops not found");
    const shopIds = shops.map(shop => shop._id) 
    const items = await Item.find({shop:{$in:shopIds}})
    return res.success("Items retrieved by city successfully.", items);
  } catch (err) {
    return res.error("Error while retrieving items by city", err);

  }
}

export const getItemsByShop = async (req, res) => {
    try {
      const {shopId}  = req.params
      const shop = await Shop.findById(shopId);
      if(!shop){
          return res.error("Shop Not Found.");
      }
      await shop.populate("items")
      return res.success("Shop Details", {shop,items:shop.items})
    } catch (err) {
      console.error(err);
      return res.error("Error while fetching shop", err);
  
    }
  }
export const searchItems = async (req, res) => {
    try {
      const {query, city}  = req.query
      if(!query || !city){
          return res.error("Query and city are required.");
      }
      const shops = await Shop.find({city:{$regex: new RegExp(`^${city}$`,"i")}}).populate("items")
      if (!shops || shops.length === 0) return res.error("Shops not found");
      const shopIds = shops.map(shop => shop._id) 
      const items = await Item.find({
        shop:{$in:shopIds},
        $or:[
            {name:{$regex:query,$options:"i"}},
            {category:{$regex:query,$options:"i"}},
        ]
    }).populate("shop","name image")

      return res.success("Items List", items)
    } catch (err) {
      console.error(err);
      return res.error("Error while fetching items", err);
  
    }
  }


  export const rating = async (req, res) => {
    try {
        const {itemId, rating} = req.body
        if(!itemId || !rating){
            return res.error("Item ID and rating are required.");
        }
        if(rating < 1 || rating > 5){
            return res.error("Rating must be between 1 to 5");
        }
        const item = await Item.findById(itemId)
        if(!item){
            return res.error("Item not found");
        }
        const newCount = item.rating.count + 1
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount
        item.rating.count = newCount
        item.rating.average = newAverage
        await item.save()
        return res.success("Rating Updated successfully", {rating:item.rating})

    } catch (err) {
      console.error(err);
      return res.error("Error while updating item rating", err);

    }
  }