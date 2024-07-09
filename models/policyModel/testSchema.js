import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  fullName: { type: String },
  partnerId: { type: String },
  email: {
    type: String,
  },
  rcFront: { type: String, trim: true },
  rcBack: { type: String, trim: true },
  perviousPolicy: { type: String, trim: true },
  survey: { type: String, trim: true },
  puc: { type: String, trim: true },
  fitness: { type: String, trim: true },
  proposal: { type: String, trim: true },
  currentPolicy: { type: String, trim: true },
  other: { type: String, trim: true },
});
export default mongoose.model("testmodel", TestSchema);
