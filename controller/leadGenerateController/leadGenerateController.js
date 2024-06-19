import leadGenerateModel from "../../models/leadGenerateModels/leadGenerateSchema.js";
import leadCommentsAndQuotationModel from "../../models/leadGenerateModels/leadCommentsAndQuotationModel.js";
import leadGeneratePaymentModel from "../../models/leadGenerateModels/leadGeneratePaymentModel.js";

// Create a new lead
const createNewLead = async (req, res) => {
  try {
    const { leadID,createdBy,updatedBy,agentID, policyType, category,subCategory,company,caseType,policyStatus,comments,documents,remarks,quotation} = req.body;

    // Check if all required fields are provided
    if (!leadID || !agentID || !policyType || !category || !subCategory || !company || !caseType || !policyStatus || !comments || !documents || !remarks || !quotation) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newLead  = new leadGenerateModel({
      agentID,
      leadID,
      policyType,
      category,
      subCategory,
      company,
      caseType,
      policyStatus,
      documents,
      remarks,
      createdBy,
      updatedBy
    });

    await newLead.save();
    res.status(200).json({
      message: "New Lead created successfully",
      data: newLead,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating New Lead :", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new lead ",
      error: error.message,
    });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await leadGenerateModel.find();
    res.status(200).json({
      message: "Success! Here are all the leads",
      data: leads,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve leads" });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
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
      message: "Success! Here is the broker name with ID",
      data: existingLead,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve Lead" });
  }
};

// Update Lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if Lead exists and update in one step
    const updatedLead = await leadGenerateModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedLead) {
      return res.status(404).json({ status: "failed", message: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead updated successfully",
      data: updatedLead,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating Lead:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update Lead",
    });
  }
};



// Delete Lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Lead exists
    const existingLead = await leadGenerateModel.findById(id);
    if (!existingLead) {
      return res
        .status(404)
        .json({ status: "failed", message: "lead not found" });
    }

    // Delete the lead
    await leadGenerateModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete the lead" });
  }
};




// lead comments and quotations
const leadCommentsAndQuotation = async (req, res) => {

  const agentID = req.params.id;

  if(!agentID){
    return res.status(400).json({message:"please provide agentID found"})
  }
  const { leadID,status, comments, quotation , createdBy, updatedBy } = req.body;

    if (!comments && !quotation) {
      return res.status(400).json({ message: 'Please provide Comments or Quotations' });
    }

  try {

    // Create a new instance of the model with the request body
    const newLeadUpdate = new leadCommentsAndQuotationModel({
      agentID,
      leadID,
      status,
      comments,
      quotation,
      createdBy,
      updatedBy,
    });

    // Save the new instance to the database
    const savedComment = await newLeadUpdate.save();

    res.status(201).json({
      status:"success" ,
      data: savedComment}); // Respond with the saved data
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Failed to save comment' });
  }
}



// get comments and quotation by leadID
const getCommentsAndQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if comments and quotation exists
    const commentsAndQuotation = await leadCommentsAndQuotationModel.find({leadID:id});
    if (!commentsAndQuotation) {
      return res
        .status(404)
        .json({ status: "failed", message: "no comments or quotation found" });
    }
    res.status(200).json({
      message: "Success! Here are the comments and quotation",
      data: commentsAndQuotation,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve comments and quotation" });
  }
};




// lead payment controller

const leadGeneratePaymentController = async (req, res) => {

  const agentID = req.params.id;

  const { leadID,paymentLink,paymentProof, paymentStatus, createdBy, updatedBy } = req.body;

    if (!paymentProof && !paymentLink) {
      return res.status(400).json({ message: 'Please provide paymentProof or paymentLink' });
    }

  try {

    // Create a new instance of the model with the request body
    const newPaymentUpdate = new leadGeneratePaymentModel({
      agentID,
      leadID,
      paymentLink,
      paymentProof,
      paymentStatus,
      createdBy,
      updatedBy,
    });

    // Save the new instance to the database
    const savedPayment = await newPaymentUpdate.save();

    res.status(201).json({
      status:"success" ,
      message: "details saved successfully",
      data: savedPayment}); // Respond with the saved data
  } catch (error) {
    console.error('Error saving details:', error);
    res.status(500).json({ message: 'Failed to save details' });
  }
}

const getLeadPaymentDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any payment details exists
    const paymentDetails = await leadGeneratePaymentModel.find({leadID:id});
    if (!paymentDetails) {
      return res
        .status(404)
        .json({ status: "failed", message: "no payment details found" });
    }
    res.status(200).json({
      message: "Success! Here are all the details",
      data: paymentDetails,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve payment details" });
  }
};

export {
  createNewLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  leadCommentsAndQuotation,
  leadGeneratePaymentController,
  getCommentsAndQuotationById,
  getLeadPaymentDetailsById
};



















