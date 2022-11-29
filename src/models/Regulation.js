import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RegulationSchema = Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

module.exports = mongoose.model("regulations", RegulationSchema);

