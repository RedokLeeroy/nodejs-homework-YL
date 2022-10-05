const jwt = require("jsonwebtoken");
const RequestError = require("../helpers/RequestError");
const User = require("../model/users");
require("dotenv").config();

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw RequestError(401, "bearer wrong");
    }

    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
