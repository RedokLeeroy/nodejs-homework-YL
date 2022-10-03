const express = require("express");
const RequestError = require("../../helpers/RequestError");
const Joi = require("joi");
const User = require("../../model/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { SECRET_KEY } = process.env;

const registerSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
  subscription: Joi.string(),
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().required(),
});

const routerAuth = express.Router();

routerAuth.post("/register", async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    const { email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const user = await User.findOne({ email });
    if (user) {
      throw RequestError(409, "User already registred");
    }
    const result = await User.create({ email, hashPass });
    if (error) {
      throw RequestError(400, "missing required fields");
    }
    res.json({
      user: { subscription: result.subscription, email: result.email },
    });
  } catch (error) {
    next();
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
    const comparePass = await bcrypt.compare(password, user.password);
    if (comparePass) {
      throw RequestError(401, "wrong pass");
    }
    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    if (error) {
      throw RequestError(400, "missing required fields");
    }
    res.json({ token });
  } catch (error) {
    next();
  }
});

module.exports = routerAuth;
