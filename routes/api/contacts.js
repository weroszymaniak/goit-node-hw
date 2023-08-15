import express from "express";
import Joi from "joi";

import {
  fetchContacts,
  updateContactsData,
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} from "../../models/contacts.js";

export const contactsRouter = express.Router();

contactsRouter.get("/", async (req, res, next) => {
  try {
    const contacts = await fetchContacts();
    res.json({
      status: "success",
      code: 200,
      data: { contacts },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await fetchContacts(contactId);

    if (!contact) {
      res.status(404).json(`Contact not found`);
    }

    res.json({
      status: "success",
      code: 200,
      data: { contact },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
});

contactsRouter.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name) {
    return res.status(400).json({ message: "missing required name field" });
  }

  if (!email) {
    return res.status(400).json({ message: "missing required email field" });
  }

  if (!phone) {
    return res.status(400).json({ message: "missing required phone field" });
  }

  try {
    const newContact = await addContact({ name, email, phone });
    res.status(201).json({
      status: "success",
      code: 201,
      data: newContact,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
});

contactsRouter.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    await removeContact(contactId);
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

contactsRouter.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    return res.status(400).json({ message: "missing fields" });
  }

  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (email) updatedFields.email = email;
  if (phone) updatedFields.phone = phone;

  try {
    const updatedContact = await updateContact(contactId, updatedFields);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
    });
  }
});
