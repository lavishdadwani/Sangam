import Shop from "../models/shop.model";
import uploadOnCloudinary from "../utils/cloudinary";

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
      shop = Shop.create({
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
        
    await shop.populate("owner");

    return res.success("Shop Created Successfully.", shop);
  } catch (err) {
    return res.error("got create shop user error", err);
  }
};
