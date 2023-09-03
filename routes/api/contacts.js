import express from "express";
import { auth } from "../../config/config-passport.js";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} from "../../models/contacts.js";

export const contactsRouter = express.Router();

contactsRouter.get("/", auth, async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json({
      status: "success",
      code: 200,
      data: { contacts },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: `Internal Server Error" ${error}`,
    });
  }
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);

    if (!contact) {
      return res.status(404).json(`Contact not found`);
    }
    return res.json({
      status: "success",
      code: 200,
      data: { contact },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: `Internal Server Error ${error}`,
    });
  }
});

contactsRouter.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const contact = await addContact({ name, email, phone });
    res.status(201).json({
      status: "success",
      code: 201,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: `Internal Server Error ${error}`,
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

  const updatedFields = { name, email, phone };

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

contactsRouter.patch("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  try {
    const existingContact = await getContactById(contactId);
    if (!existingContact) {
      return res.status(404).json({ message: "Not found" });
    }
    const updatedContact = await updateStatusContact(contactId, {
      favorite,
    });
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
