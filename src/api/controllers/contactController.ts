import { Request, Response } from "express";
import contactService from "../services/contactService";

interface AuthenticatedRequest extends Request {
  user?: { email: string };
}

// Create contact
const createContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
    } = req.body;

    const { email } = req.user!;

    const data = {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
    };

    // Create the contact using the contactService
    const newContact = await contactService.createContact(
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
      email
    );

    res.status(201).json({
      message: "Contact created successfully",
      success: true,
      contact: newContact,
    });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Read contact by ID
const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = contactService.getContactById(id);

    if (!contact) {
      throw { status: 404, message: "Contact not found" };
    }

    res.status(200).json({ status: "OK", message: "success", contact });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Read all contacts
const getAllContacts = async (req: Request, res: Response) => {
  try {
    // Fetch all contacts using Prisma
    const contacts = contactService.getAllContacts();
    res.status(200).json({ status: "OK", message: "success", contacts });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Update contact
const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update the contact using Prisma
    const updatedContact = contactService.updateContact(id, updateData);

    // Handle case where contact is not found
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Respond with the updated contact
    res.status(200).json(updatedContact);
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Delete contact
const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const contact = contactService.getContactById(id);

    if (!contact) {
      throw { status: 404, message: "Contact not found" };
    }

    // Delete the contact using Prisma
    const deletedContact = contactService.deleteContact(id);

    // Respond with success message
    res
      .status(200)
      .json({ message: "Contact deleted successfully", deletedContact });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export default {
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
};
