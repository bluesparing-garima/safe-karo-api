import express from "express";
import {
    createUserProfile,
    getUserProfileById,
    updateUserProfile,
    deleteUserProfile,
    getAllUserProfiles,
    getUserProfilesByRole,
    checkEmailExists
} from "../controller/adminController/userProfileController.js";
import {
    createPartner,
    getAllPartners,
    getPartnerById,
    updatePartner,
    deletePartner
} from "../controller/adminController/partnerController.js";

const router = express.Router();

// User profile routes
router.post("/", createUserProfile);
router.get("/byRole", getUserProfilesByRole);
router.get("/", getAllUserProfiles);
router.get('/check-email', checkEmailExists); 
router.get("/:id", getUserProfileById);
router.put("/:id", updateUserProfile);
router.delete("/:id", deleteUserProfile);

// Partner routes
router.post('/partners', createPartner);
// router.get('/partners', getAllPartners);
router.get('/partners/:id', getPartnerById);
router.put('/partners/:id', updatePartner);
router.delete('/partners/:id', deletePartner);

export default router;
