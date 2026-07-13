import mongoose from "mongoose";

const adoptionRequestSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true, index: true },
    petName: { type: String, required: true },
    petImage: { type: String },

    // Pet owner's email — this is who is authorized to approve/reject.
    ownerEmail: { type: String, required: true, index: true },

    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true, index: true },

    pickupDate: { type: String, required: true },
    message: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdoptionRequest", adoptionRequestSchema);
