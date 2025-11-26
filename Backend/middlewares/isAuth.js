import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
  try {
      console.log(req.cookies)
    const token = req.cookies.token;
    if (!token) {
      return res.unauthorized("token not found");
    }
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken) {
      return res.unauthorized("token not verify");
    }
    req.userId = decodeToken.userId;
    next();
  } catch (err) {
    return res.error("isAuth error", err);
  }
};

export default isAuth