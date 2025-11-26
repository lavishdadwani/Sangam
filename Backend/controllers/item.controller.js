import Item from "../models/item.model";
import Shop from "../models/shop.model";

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

    return res.success("Item Created Successfully.", item);
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
    return res.success("Item Created Successfully.", shop);
  } catch (err) {
    return res.error("Got Edit Item  Error", err);
  }
};
