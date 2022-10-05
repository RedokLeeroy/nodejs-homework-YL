const express = require("express");
const RequestError = require("../../helpers/RequestError");
const Joi = require("joi");
const Contact = require("../../model/contacts");
const authenticate = require("../../helpers/authenticate");

const router = express.Router();

const Schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean().required(),
});

const SchemaFavorite = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findOne({ _id: contactId });
    if (result === null) {
      throw RequestError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = Schema.validate(req.body);
    const result = await Contact.create(req.body);
    if (error) {
      throw RequestError(400, "missing required name field");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);
    if (result === null) {
      throw RequestError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { error } = Schema.validate(req.body);
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (error) {
      throw RequestError(400, "missing fields");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  try {
    const { error } = SchemaFavorite.validate(req.body);
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (error) {
      throw RequestError(400, "missing field Favorite");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
