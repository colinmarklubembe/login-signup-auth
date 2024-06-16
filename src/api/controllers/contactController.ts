import { Request, Response } from "express";
import prisma from "../../prisma/client";
import contactService from "../services/contactService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string }; // Ensure user object includes id for userId
}

// Create contact
const createContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      contactEmail, // Rename to contactEmail to avoid conflict with req.user.email
      phoneNumber,
      title,
      leadStatus = "LEAD",
      location,
      businessType,
      description,
    } = req.body;

    // Extract user details from request
    const { email } = req.user!;

    // Ensure required fields are present
    if (
      !fullName ||
      !contactEmail ||
      !phoneNumber ||
      !title ||
      !location ||
      !businessType ||
      !description
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const addedByUserId = user.id;

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
      addedByUserId // Pass userId to service layer
    );

    // Respond with success message, token, and new contact details
    res.status(201).json({
      message: "Contact created successfully",
      success: true,
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).send("Error creating contact");
  }
};

// Read contact by ID
const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the contact by ID using Prisma
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    // Handle case where contact is not found
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Respond with the found contact
    res.status(200).json({ status: "OK", message: "success", contact });
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res.status(500).send("Error fetching contact by ID");
  }
};

// Read all contacts
const getAllContacts = async (req: Request, res: Response) => {
  try {
    // Fetch all contacts using Prisma
    const contacts = await prisma.contact.findMany();
    res.status(200).json({status:"OK", message:"success", contacts});
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    res.status(500).send("Error fetching all contacts");
  }
};

// Update contact
const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update the contact using Prisma
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: updateData,
    });

    // Handle case where contact is not found
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Respond with the updated contact
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).send("Error updating contact");
  }
};

// Delete contact
const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete the contact using Prisma
    const deletedContact = await prisma.contact.delete({
      where: { id },
    });

    // Handle case where contact is not found
    if (!deletedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Respond with success message
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).send("Error deleting contact");
  }
};

export default {
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
};
