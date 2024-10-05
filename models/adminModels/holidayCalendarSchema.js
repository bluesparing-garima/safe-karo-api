import mongoose from 'mongoose'
const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
});

const HolidayCalendarSchema = mongoose.model('Holidaycalender', holidaySchema);

export default HolidayCalendarSchema;