import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId, // Change to ObjectId
      ref: "UserProfile", // Reference to the UserProfileModel
      required: true, // Make this required to ensure an employee is associated
    },
    employeeName: {
      type: String,
      trim: true,
    },
    attendanceType: {
      type: String,
      enum: ["present", "leave", "half day"],
      required: true,
    },
    inTime: {
      type: Date,
      required: function () {
        return this.attendanceType === "present"; // Only required for present
      },
    },
    outTime: {
      type: Date,
      required: function () {
        return this.attendanceType === "present"; // Only required for present
      },
    },
    totalHours: {
      type: Number,
      required: function () {
        return this.attendanceType === "present" && !!this.outTime; // Only required for present when outTime is present
      },
    },
    remarks: {
      type: String,
      required: function () {
        return this.attendanceType === "leave" || this.attendanceType === "half day"; // Required for leave and half-day
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Change to ObjectId
      ref: "UserProfile", // Reference to the UserProfileModel
      trim: true,
    },
    updatedOn: {
      type: Date,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId, // Change to ObjectId
      ref: "UserProfile", // Reference to the UserProfileModel
      trim: true,
    },
  },
  { timestamps: true }
);

const AttendanceModel = mongoose.model("Attendance", attendanceSchema);

export default AttendanceModel;
