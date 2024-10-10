import HolidayCalendar from "../../models/adminModels/holidayCalendarSchema.js";
import moment from "moment";

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const holiday = new HolidayCalendar({ date, name });
    await holiday.save();
    res
      .status(201)
      .json({ message: "HolidayCalendar created successfully", holiday,status:"success"});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await HolidayCalendar.find();

    // Format date and add day name for each holiday
    const formattedHolidays = holidays.map((holiday) => ({
      _id: holiday._id,
      date: moment(holiday.date).format("YYYY-MM-DD"),
      day: moment(holiday.date).format("dddd"),
      name: holiday.name,
    }));

    res.status(200).json( {message: "HolidayCalendar retrived successfully",formattedHolidays, status:"success"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get holidays within a date range
export const getHolidaysByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date format
    if (
      !moment(startDate, "YYYY-MM-DD", true).isValid() ||
      !moment(endDate, "YYYY-MM-DD", true).isValid()
    ) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    const holidays = await HolidayCalendar.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Format date and add day name for each holiday
    const formattedHolidays = holidays.map((holiday) => ({
      _id: holiday._id,
      date: moment(holiday.date).format("YYYY-MM-DD"),
      day: moment(holiday.date).format("dddd"),
      name: holiday.name,
    }));

    res.status(200).json({ message: "HolidayCalendar retrived successfully with date range.",formattedHolidays, status: "success"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a holiday by ID
export const getHolidayById = async (req, res) => {
  try {
    const holiday = await HolidayCalendar.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "HolidayCalendar not found" });
    }

    // Format date and add day name
    const formattedHoliday = {
      _id: holiday._id,
      date: moment(holiday.date).format("YYYY-MM-DD"),
      day: moment(holiday.date).format("dddd"),
      name: holiday.name,
    };

    res.status(200).json({ message: "HolidayCalendar retrived successfully by Id",formattedHoliday, status: "success"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const holiday = await HolidayCalendar.findByIdAndUpdate(
      req.params.id,
      { date, name },
      { new: true, runValidators: true }
    );
    if (!holiday) {
      return res.status(404).json({ message: "HolidayCalendar not found" });
    }
    res
      .status(200)
      .json({ message: "HolidayCalendar updated successfully", holiday, status:"success" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await HolidayCalendar.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "HolidayCalendar not found" });
    }
    res.status(200).json({ message: "HolidayCalendar deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
