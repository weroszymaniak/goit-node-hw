import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import Joi from "joi";

const contactsPath = path.resolve("./models", "contacts.json");

const contactIdSchema = Joi.string().required();
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

export const fetchContacts = async () => {
  try {
    const contacts = await readFile(contactsPath);
    return JSON.parse(contacts);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const updateContactsData = async (contacts) => {
  try {
    const stringifyContacts = JSON.stringify(contacts);
    await writeFile(contactsPath, stringifyContacts);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const listContacts = async () => {
  try {
    const contacts = await fetchContacts();
    return contacts;
  } catch (error) {
    console.error("Error getting contacts:", error.message);
    throw error;
  }
};

export const getContactById = async (contactId) => {
  try {
    const { error: contactIdError } = contactIdSchema.validate(contactId);

    if (contactIdError) {
      return { error: "Invalid Contact ID" };
    }

    const contacts = await fetchContacts();
    const contact = contacts.find((el) => el.id === contactId);

    return contact || null;
  } catch (error) {
    console.log("Error getting contact by ID:", error.message);
    throw error;
  }
};

export const removeContact = async (contactId) => {
  try {
    const { error: contactIdError } = contactIdSchema.validate(contactId);

    if (contactIdError) {
      return { error: "Invalid Contact ID" };
    }
    const contacts = await fetchContacts();
    const elementIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );
    if (elementIndex === -1) {
      console.log(`Contact with ID ${contactId} not found.`);
      return null;
    }
    contacts.splice(elementIndex, 1);
    await updateContactsData(contacts);
    console.log(`Contact with ID ${contactId} has been removed.`);
  } catch (error) {
    console.log("Error removing contact by ID:", error.message);
    throw error;
  }
};

export const addContact = async (body) => {
  try {
    const { error } = contactSchema.validate(body);
    if (error) {
      return { error: "Invalid input. Please provide valid contact details." };
    }

    const contacts = await fetchContacts();

    if (contacts && contacts.length > 0) {
      const { name, email, phone } = body;
      const newContact = {
        id: nanoid(),
        name,
        email,
        phone,
      };

      contacts.push(newContact);
      await updateContactsData(contacts);

      console.log("Contact has been added successfully");
      return newContact;
    } else {
      console.log("Contacts list is not available or empty.");
    }
  } catch (error) {
    console.log("Error adding new contact", error);
    throw error;
  }
};

export const updateContact = async (contactId, body) => {
  try {
    const { error: contactIdError } = contactIdSchema.validate(contactId);

    if (contactIdError) {
      return { error: "Invalid Contact ID" };
    }

    const { error: bodyError } = contactSchema.validate(body);
    if (bodyError) {
      return { error: "Invalid input. Please provide valid contact details." };
    }

    const contacts = await fetchContacts();

    const elementIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );
    if (elementIndex === -1) {
      console.log(`Contact with ID ${contactId} not found.`);
      return null;
    }

    const updatedContact = { ...contacts[elementIndex], ...body };
    contacts[elementIndex] = updatedContact;

    await updateContactsData(contacts);

    console.log(`Contact with ID ${contactId} has been updated.`);
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};
