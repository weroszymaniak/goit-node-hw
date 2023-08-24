import Contact from "../service/schemas/contacts.js";

export const listContacts = async () => {
  try {
    return await Contact.find();
  } catch (error) {
    console.error("Error getting contacts:", error.message);
    throw error;
  }
};

export const getContactById = async (contactId) => {
  try {
    return await Contact.findOne({ _id: contactId });
  } catch (error) {
    console.log("Error getting contact by ID:", error.message);
    throw error;
  }
};

export const removeContact = async (contactId) => {
  try {
    return await Contact.findByIdAndRemove({ _id: contactId });
  } catch (error) {
    console.log("Error removing contact by ID:", error.message);
    throw error;
  }
};

export const addContact = async (body) => {
  try {
    return await Contact.create(body);
  } catch (error) {
    console.log("Error adding new contact", error);
    throw error;
  }
};

export const updateContact = async (contactId, body) => {
  try {
    return await Contact.findByIdAndUpdate({ _id: contactId }, body, {
      new: true,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

export const updateStatusContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    return updatedContact;
  } catch {
    console.error("Error updating contact status:", error);
    throw error;
  }
};
