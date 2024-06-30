import { Request, Response } from "express";
import { contactService, organizationService } from "../services";
import userService from "../../api/auth/services/userService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
  organization?: { organizationId: string };
}

// Create contact
const createContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus = "LEAD",
      location,
      businessType,
      description,
    } = req.body;
    const { email } = req.user!;
    const { organizationId } = req.organization!;

    // Check if user exists
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const addedByUserId = user.id;
    // check if user belongs to the organization
    const userOrganization = await userService.findUserOrganization(
      addedByUserId,
      organizationId
    );

    if (!userOrganization) {
      return res.status(403).json({
        success: false,
        error: "User does not belong to the Organization",
      });
    }
    // Check if contact email already exists
    const existingContactByEmail = await contactService.findContactByEmail(
      contactEmail.trim().toLowerCase()
    );
    if (existingContactByEmail) {
      return res.status(409).json({
        success: false,
        error: "Contact with the same email already exists",
      });
    }

    // Check if contact phone number already exists
    const existingContactByPhone =
      await contactService.findContactByPhoneNumber(phoneNumber);
    if (existingContactByPhone) {
      return res.status(409).json({
        success: false,
        error: "Contact with the same phone number already exists",
      });
    }
    //create new contact
    const data = {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
      addedByUserId,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newContact = await contactService.createContact(data);
    res.status(201).json({
      message: "Contact created successfully",
      success: true,
      newContact: newContact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read contact by ID
const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await contactService.getContactById(id);

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }

    res.status(200).json({
      message: "Contact retrieved successfully",
      success: true,
      contact: contact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read all contacts
const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.status(200).json({
      message: "All contacts retrieved successfully",
      success: true,
      contacts: contacts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update contact
const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    const contactId = id;
    // Check if the contact exists
    const contact = await contactService.findContactById(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }
    const newData = {
      fullName,
      contactEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
      updatedAt: new Date().toISOString(),
    };
    const updatedContact = await contactService.updateContact(
      contactId,
      newData
    );

    res.status(200).json({
      message: "Contact updated successfully",
      success: true,
      updatedContact: updatedContact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete contact
const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contactId = id;

    // Check if the contact exists
    const contact = await contactService.findContactById(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }
    const deletedContact = contactService.deleteContact(contactId);

    res.status(200).json({
      message: "Contact deleted successfully",
      success: true,
      deletedContact: deletedContact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getContactsByOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { organizationId } = req.organization!;

    // Check if the organization exists
    const organization = await organizationService.findOrganizationById(
      organizationId
    );

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: "Organization not found" });
    }

    // Fetch contacts for the organization
    const contacts = await contactService.getContactsByOrganization(
      organizationId
    );

    if (!contacts) {
      return res.status(404).json({
        success: false,
        error: `No contacts found for the organization: ${organization.name}`,
      });
    }

    res.status(200).json({
      message: `Contacts belonging to the organization ${organization.name} retrieved successfully`,
      success: true,
      organizationContacts: contacts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const changeLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leadStatus } = req.body;
    const contactId = id;

    // Check if the contact exists
    const contact = await contactService.findContactById(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }

    const newData = {
      leadStatus,
      updatedAt: new Date().toISOString(),
    };

    const updatedContact = await contactService.updateContact(
      contactId,
      newData
    );

    res.status(200).json({
      message: `Contact lead status updated from ${contact.leadStatus} to ${updatedContact.leadStatus} successfully`,
      success: true,
      updatedContact: updatedContact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  createContact,
  getContactById,
  getAllContacts,
  updateContact,
  deleteContact,
  getContactsByOrganization,
  changeLeadStatus,
};
