import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createShop = async (req, res) => {
  try {
    const { name, city, address, state } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const owner = req.userId;
    let shop = await Shop.findOne({ owner });
    if (!shop) {
      // IMPORTANT: await here so we get a Mongoose document, not a Promise
      shop = await Shop.create({
        name,
        city,
        address,
        image,
        state,
        owner,
      });
    } else {
        shop = await Shop.findByIdAndUpdate(
            shop._id,
            { name, city, address, image, state, owner },
            { new: true }
            );
        }
        
    // Guard in case something went wrong and shop is still null
    if (!shop) {
      return res.error("Shop not found after create/update");
    }

    await shop.populate("owner items");

    return res.success("Shop Created Successfully.", shop);
  } catch (err) {
      console.log(err);
    return res.error("Error while creating shop", err);
  }
};

export const  getShop = async (req,res) =>{
    try{
        const owner = req.userId
        const shop = await Shop.findOne({owner}).populate('owner').populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return res.error("Shop not found");
        }
        return res.success("Success", shop);
    }catch(err){
        return res.error("Error while creating shop", err);
    }
}

export const getShopByCity = async (req, res) => {
  try {
    const {city} = req.params
    const shops = await Shop.find({city:{$regex: new RegExp(`^${city}$`,"i")}}).populate("items");
    if(!shops || shops.length === 0){
        return res.error("Shops not found");
    }
    return res.success("Success", shops);
  } catch (err) {
    return res.error("Error while retrieving shops by city", err);
  }
}