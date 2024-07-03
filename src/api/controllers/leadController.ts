import { LeadStatus } from "@prisma/client";
import { Request, Response } from "express";
import { mapStringToEnum, responses } from "../../utils";
import { organizationService, leadService } from "../services";
import userService from "../auth/services/userService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
  organization?: { organizationId: string };
}

class LeadController {
  // Create lead
  async createLead(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        firstName,
        middleName,
        lastName,
        businessName,
        contactPerson,
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
        return responses.errorResponse(res, 404, "User not found");
      }

      const addedByUserId = user.id;
      // check if user belongs to the organization
      const userOrganization = await userService.findUserOrganization(
        addedByUserId,
        organizationId
      );

      if (!userOrganization) {
        return responses.errorResponse(
          res,
          403,
          "User does not belong to the organization"
        );
      }
      // Check if lead email already exists
      const existingLeadByEmail = await leadService.findLeadByEmail(
        leadEmail.trim().toLowerCase()
      );
      if (existingLeadByEmail) {
        return responses.errorResponse(
          res,
          409,
          "Lead with the same email already exists"
        );
      }

      // Check if lead phone number already exists
      const existingLeadByPhone = await leadService.findLeadByPhoneNumber(
        phoneNumber
      );
      if (existingLeadByPhone) {
        return responses.errorResponse(
          res,
          409,
          "Lead with the same phone number already exists"
        );
      }
      //create new lead
      const data = {
        firstName,
        middleName,
        lastName,
        businessName,
        contactPerson,
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

      responses.successResponse(res, 201, "Lead created successfully", {
        newLead: newLead,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Read lead by ID
  async getLeadById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const lead = await leadService.getLeadById(id);

      if (!lead) {
        return responses.errorResponse(res, 404, "Lead not found");
      }

      responses.successResponse(res, 200, "Lead retrieved successfully", lead);
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Read all leads
  async getAllLeads(req: Request, res: Response) {
    try {
      const leads = await leadService.getAllLeads();

      if (!leads) {
        return responses.errorResponse(res, 404, "No leads found");
      }

      responses.successResponse(res, 200, "Leads retrieved successfully", {
        leads: leads,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Update lead
  async updateLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        firstName,
        middleName,
        lastName,
        businessName,
        contactPerson,
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
        return responses.errorResponse(res, 404, "Lead not found");
      }
      const newData = {
        firstName,
        middleName,
        lastName,
        businessName,
        contactPerson,
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

      responses.successResponse(res, 200, "Lead updated successfully", {
        updatedLead: updatedLead,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Delete lead
  async deleteLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leadId = id;

      // Check if the lead exists
      const lead = await leadService.findLeadById(leadId);
      if (!lead) {
        return responses.errorResponse(res, 404, "Lead not found");
      }
      const deletedLead = leadService.deleteLead(leadId);

      responses.successResponse(res, 200, "Lead deleted successfully", {
        deletedLead: deletedLead,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Get leads by organization
  async getLeadsByOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.organization!;

      // Check if the organization exists
      const organization = await organizationService.findOrganizationById(
        organizationId
      );

      if (!organization) {
        return responses.errorResponse(res, 404, "Organization not found");
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
        return responses.errorResponse(
          res,
          404,
          `No leads found for the organization ${organization.name}`
        );
      }

      const totalPages = Math.ceil(totalLeads / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      responses.successResponse(res, 200, "Leads retrieved successfully", {
        leads: leads,
        totalLeads: totalLeads,
        totalPages: totalPages,
        currentPage: page,
        nextPage: nextPage,
        prevPage: prevPage,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Change lead status
  async changeLeadStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { leadStatus, description } = req.body;
      const leadId = id;

      let mappedLeadStatus: any;
      mappedLeadStatus = mapStringToEnum.mapStringToLeadStatus(leadStatus, res);

      // Check if the lead exists
      const lead = await leadService.findLeadById(leadId);
      if (!lead) {
        return responses.errorResponse(res, 404, "Lead not found");
      }

      const newData = {
        leadStatus: mappedLeadStatus,
        description: description,
        updatedAt: new Date().toISOString(),
      };

      const updatedLead = await leadService.updateLead(leadId, newData);

      responses.successResponse(res, 200, "Lead status updated successfully", {
        updatedLead: updatedLead,
      });
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }

  // Get organization leads
  async getOrganizationLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { leadStatus } = req.query;

      if (!leadStatus) {
        return responses.errorResponse(res, 400, "Lead status is required");
      }

      if (!((leadStatus as string) in LeadStatus)) {
        return responses.errorResponse(
          res,
          400,
          "Invalid lead status. Lead status must be either 'LEAD', 'PROSPECT' or 'CLOSED'"
        );
      }
      const Leads = await leadService.getOrganizationLeads(
        organizationId,
        leadStatus as string
      );

      if (!Leads) {
        return responses.errorResponse(
          res,
          404,
          `No ${leadStatus}S found for the organization`
        );
      }

      const formatLeadStatus = (leadStatus as string)
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());

      responses.successResponse(
        res,
        200,
        `${formatLeadStatus}s retrieved successfully`,
        {
          Leads: Leads,
        }
      );
    } catch (error: any) {
      responses.errorResponse(res, 500, error.message);
    }
  }
}

export default new LeadController();
