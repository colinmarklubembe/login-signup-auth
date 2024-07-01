import { Request, Response } from "express";
import { mapStringToEnum } from "../../utils";
import { organizationService, leadService } from "../services";
import userService from "../auth/services/userService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
  organization?: { organizationId: string };
}

// Create lead
const createLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      leadEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
    } = req.body;
    const { email } = req.user!;
    const { organizationId } = req.organization!;

    let mappedLeadStatus: any;
    let mappedBusinessType: any;

    mappedLeadStatus = mapStringToEnum.mapStringToLeadStatus(leadStatus, res);
    mappedBusinessType = mapStringToEnum.mapStringToBusinessType(
      businessType,
      res
    );

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
    // Check if lead email already exists
    const existingLeadByEmail = await leadService.findLeadByEmail(
      leadEmail.trim().toLowerCase()
    );
    if (existingLeadByEmail) {
      return res.status(409).json({
        success: false,
        error: "Lead with the same email already exists",
      });
    }

    // Check if lead phone number already exists
    const existingLeadByPhone = await leadService.findLeadByPhoneNumber(
      phoneNumber
    );
    if (existingLeadByPhone) {
      return res.status(409).json({
        success: false,
        error: "Lead with the same phone number already exists",
      });
    }
    //create new lead
    const data = {
      fullName,
      leadEmail,
      phoneNumber,
      title,
      leadStatus: mappedLeadStatus,
      location,
      businessType: mappedBusinessType,
      description,
      addedByUserId,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newLead = await leadService.createLead(data);
    res.status(201).json({
      message: "Lead created successfully",
      success: true,
      newLead: newLead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read lead by ID
const getLeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await leadService.getLeadById(id);

    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead retrieved successfully",
      success: true,
      lead: lead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read all leads
const getAllLeads = async (req: Request, res: Response) => {
  try {
    const leads = await leadService.getAllLeads();
    res.status(200).json({
      message: "All leads retrieved successfully",
      success: true,
      leads: leads,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update lead
const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      leadEmail,
      phoneNumber,
      title,
      leadStatus,
      location,
      businessType,
      description,
    } = req.body;
    const leadId = id;

    let mappedLeadStatus: any;
    let mappedBusinessType: any;

    mappedLeadStatus = mapStringToEnum.mapStringToLeadStatus(leadStatus, res);
    mappedBusinessType = mapStringToEnum.mapStringToBusinessType(
      businessType,
      res
    );

    // Check if the lead exists
    const lead = await leadService.findLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    const newData = {
      fullName,
      leadEmail,
      phoneNumber,
      title,
      leadStatus: mappedLeadStatus,
      location,
      businessType: mappedBusinessType,
      description,
      updatedAt: new Date().toISOString(),
    };
    const updatedLead = await leadService.updateLead(leadId, newData);

    res.status(200).json({
      message: "Lead updated successfully",
      success: true,
      updatedLead: updatedLead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete lead
const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leadId = id;

    // Check if the lead exists
    const lead = await leadService.findLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    const deletedLead = leadService.deleteLead(leadId);

    res.status(200).json({
      message: "Lead deleted successfully",
      success: true,
      deleteLead: deleteLead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getLeadsByOrganization = async (
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

    // Get pagination parameters from the request query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Fetch leads for the organization
    const { leads, totalLeads } = await leadService.getLeadsByOrganization(
      organizationId,
      page,
      limit
    );

    if (!leads) {
      return res.status(404).json({
        success: false,
        error: `No leads found for the organization: ${organization.name}`,
      });
    }

    const totalPages = Math.ceil(totalLeads / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    res.status(200).json({
      message: `Leads belonging to the organization ${organization.name} retrieved successfully`,
      success: true,
      organizationLeads: leads,
      totalLeads: totalLeads,
      totalPages: totalPages,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const changeLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leadStatus, description } = req.body;
    const leadId = id;

    let mappedLeadStatus: any;
    mappedLeadStatus = mapStringToEnum.mapStringToLeadStatus(leadStatus, res);

    // Check if the lead exists
    const lead = await leadService.findLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const newData = {
      leadStatus: mappedLeadStatus,
      description: description,
      updatedAt: new Date().toISOString(),
    };

    const updatedLead = await leadService.updateLead(leadId, newData);

    res.status(200).json({
      message: `Lead lead status updated from ${lead.leadStatus} to ${updatedLead.leadStatus} successfully`,
      success: true,
      updatedLead: updatedLead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  createLead,
  getLeadById,
  getAllLeads,
  updateLead,
  deleteLead,
  getLeadsByOrganization,
  changeLeadStatus,
};
