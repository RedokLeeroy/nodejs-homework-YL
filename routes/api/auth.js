const express = require("express");
const RequestError = require("../../helpers/RequestError");
const Joi = require("joi");
const User = require("../../model/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../../helpers/authenticate");
const upload = require("../../helpers/upload");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

const { SECRET_KEY } = process.env;

const registerSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const routerAuth = express.Router();
routerAuth.post("/register", async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw RequestError(400, "missing required fields");
    }
    const { email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const user = await User.findOne({ email });
    if (user) {
      throw RequestError(409, "User already registred");
    }
    const result = await User.create({ email, password: hashPass, avatarURL });
    res.json({
      user: { subscription: result.subscription, email: result.email },
    });
  } catch (error) {
    next(error);
  }
});

routerAuth.post("/login", async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw RequestError(409, "wrong mail");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const comparePass = await bcrypt.compare(hashPass, user.password);
    if (comparePass) {
      throw RequestError(401, "wrong pass");
    }
    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    if (error) {
      throw RequestError(400, "missing required fields");
    }
    res.json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

routerAuth.post("/logout", authenticate, async (req, res, next) => {
  try {
    const { _id } = req.body;
    const user = await User.findByIdAndUpdate(_id, { token: null });
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

routerAuth.get("/current", authenticate, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
});

const avatarDir = path.join(__dirname, "../../public/avatars");

routerAuth.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { path: tempUpload, originalname } = req.file;
      const extention = originalname.split(".").pop();
      const filename = `${_id}.${extention}`;
      const resultUpload = path.join(avatarDir, filename);
      await fs.rename(tempUpload, resultUpload);
      const avatarURL = path.join("avatars", filename);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({
        avatarURL,
      });
    } catch (error) {
      await fs.unlink(req.file.path);
      throw error;
    }
  }
);

module.exports = routerAuth;
