import leadGenerateModel from "../../models/partnerModels/leadGenerateSchema.js";
import upload from "../../middlewares/uploadMiddleware.js";
import NotificationModel from '../../models/notificationModel.js';

export const createNewLead = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files selected!" });
    }

    try {
      const {
        policyType,
        category,
        companyName,
        caseType,
        status,
        remarks,
        partnerId,
        partnerName,
        relationshipManagerId,
        relationshipManagerName,
        leadCreatedBy,
        createdBy,
      } = req.body;

      const fileDetails = Object.keys(req.files).reduce((acc, key) => {
        req.files[key].forEach((file) => {
          acc[file.fieldname] = file.filename;
        });
        return acc;
      }, {});

      const newLead = new leadGenerateModel({
        policyType,
        category,
        companyName,
        caseType,
        status,
        ...fileDetails,
        remarks,
        partnerId: partnerId || "",
        partnerName: partnerName || "",
        relationshipManagerId: relationshipManagerId || "",
        relationshipManagerName: relationshipManagerName || "",
        leadCreatedBy,
        createdBy: createdBy,
        createdOn: new Date(),
        isActive: true,
      });

      const savedLead = await newLead.save();

      let notificationFor;
      let notificationBy;

      if (partnerId) {
        notificationFor = 'operation';
        notificationBy = partnerId;
      } else {
        notificationFor = partnerId;  
        notificationBy = leadCreatedBy;
      }

      const notification = new NotificationModel({
        title: 'Lead Generated',
        type: 'success',
        role: partnerId ? 'partner' : 'operation',
        notificationFor,
        notificationBy,
        createdBy,
      });

      await notification.save();

      res.status(200).json({
        message: "New Lead created successfully",
        data: savedLead,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to create new lead",
        error: error.message,
      });
    }
  });
};

// Get all leads
export const getAllLeads = async (req, res) => {
  try {
    const leads = await leadGenerateModel.find();
    res.status(200).json({
      message: "Success! Here are all the leads",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve leads",
      error: error.message,
    });
  }
};

// Get leads requests by leadCreatedBy
export const getleadsByCreatedBy = async (req, res) => {
  try {
    const { leadCreatedBy } = req.params;
    const leads = await leadGenerateModel.find({ leadCreatedBy });

    if (leads.length === 0) {
      return res.status(404).json({
        message: `No lead found for leadCreatedBy: ${leadCreatedBy}`,
        status: "success",
      });
    }
    res.status(200).json({
      message: "Lead retrieved successfully.",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving leads",
      error: error.message,
    });
  }
};

// Get lead by partnerID
export const getLeadsByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const leads = await leadGenerateModel.find({ partnerId });

    if (leads.length === 0) {
      return res.status(404).json({
        message: `No leads found for partnerId: ${partnerId}`,
        status: "success",
      });
    }
    res.status(200).json({
      message: "Leads retrieved successfully.",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving leads",
      error: error.message,
    });
  }
};

export const getLeadsByRMId = async (req, res) => {
  try {
    const { relationshipManagerId } = req.query;
    const leads = await leadGenerateModel.find({ relationshipManagerId });

    if (leads.length === 0) {
      return res.status(404).json({
        message: `No leads found for RelationShipManagerId: ${relationshipManagerId}`,
        status: "success",
      });
    }
    res.status(200).json({
      message: "Leads retrieved successfully.",
      data: leads,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving leads",
      error: error.message,
    });
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "Lead not found" });
    }

    res.status(200).json({
      message: "Success! Here is the lead with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve Lead",
      error: error.message,
    });
  }
};

// Accept Lead request
export const acceptLeadRequest = async (req, res) => {
  try {
    const existingLead = await leadGenerateModel.findById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatedLead = await leadGenerateModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (req.body.status === "accepted") {
      const newNotification = new NotificationModel({
        title: 'Lead Accepted',
        type: 'success',
        role: "operation",
        notificationFor: existingLead.partnerId,
        notificationBy: req.body.leadCreatedBy,
        createdBy: req.body.createdBy,
      });

      await newNotification.save();
    }
    res.status(200).json({
      message: "Lead Accepted successfully",
      data: updatedLead,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Accepting Lead",
      error: error.message,
    });
  }
};

// Update Lead
export const updateLead = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { status, updatedBy } = req.body;
      const existingLead = await leadGenerateModel.findById(req.params.id);

      if (!existingLead) {
        return res.status(404).json({
          status: "failed",
          message: "Lead not found",
        });
      }

      let fileDetails = {};
      if (req.files && Object.keys(req.files).length > 0) {
        fileDetails = Object.keys(req.files).reduce((acc, key) => {
          req.files[key].forEach((file) => {
            acc[file.fieldname] = file.filename;
          });
          return acc;
        }, {});
      }

      const updatedLeadData = {
        ...req.body,
        ...fileDetails,
      };

      const updatedLead = await leadGenerateModel.findByIdAndUpdate(
        req.params.id,
        updatedLeadData,
        { new: true }
      );

      if (status && status !== existingLead.status) {
        const notificationBy = existingLead.leadCreatedBy;
        const notificationFor = existingLead.partnerId;

        // Log notification values
        console.log("NotificationBy:", notificationBy);
        console.log("NotificationFor:", notificationFor);

        const newNotification = new NotificationModel({
          title: `Lead Status changed to ${status}`,
          type: 'success',
          role:'operation',
          isView: false,
          isActive: true,
          notificationFor,
          notificationBy,
          createdBy: updatedBy,
        });

        // Log the notification data to debug
        console.log("Notification Data:", newNotification);

        // Save the notification
        await newNotification.save().then(() => {
          console.log("Notification saved successfully");
        }).catch((saveError) => {
          console.error("Error saving notification:", saveError.message);
        });
      }

      res.status(200).json({
        message: "Lead updated successfully",
        data: updatedLead,
        status: "success",
      });
    } catch (error) {
      console.error("Error updating lead:", error.message);
      res.status(500).json({
        status: "failed",
        message: "Unable to update Lead",
        error: error.message,
      });
    }
  });
};

// Delete Lead
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "Lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Unable to delete the lead",
      error: error.message,
    });
  }
};

