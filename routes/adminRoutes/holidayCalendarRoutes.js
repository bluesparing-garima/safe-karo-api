import express from "express";
const router = express.Router();
import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  getHolidaysByDateRange
} from "../../controller/adminController/holidayCalendarController.js";
import logActivity from "../../middlewares/logActivity.js";

// Route to create a holiday
router.post("/", logActivity, createHoliday);

// Route to get all holidays
router.get("/", logActivity, getHolidays);

// Route for getting holidays by date range
router.get('/date-range', getHolidaysByDateRange);

// Route to get a holiday by ID
router.get("/:id", logActivity, getHolidayById);

// Route to update a holiday
router.put("/:id", logActivity, updateHoliday);

// Route to delete a holiday
router.delete("/:id", logActivity, deleteHoliday);

export default router;
