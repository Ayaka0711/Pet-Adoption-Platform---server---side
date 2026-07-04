// models/Pet.js
// Domain model for pet listings. Uses Mongoose (same connection as
// config/db.js) — completely separate from BetterAuth's own
// user/session/account collections in lib/mongoClient.js.

import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Fish", "Other"],
    },
    breed: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    image: { type: String, required: true },
    healthStatus: { type: String, required: true, trim: true },
    vaccinationStatus: {
      type: String,
      required: true,
      enum: ["Vaccinated", "Not Vaccinated"],
    },
    location: { type: String, required: true, trim: true },
    adoptionFee: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, required: true, trim: true },

    // Owner info — auto-filled from the logged-in user on the server,
    // never trusted from the client body.
    ownerEmail: { type: String, required: true, index: true },
    ownerName: { type: String },

    adopted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Supports name search ($regex) and species filtering ($in) from the
// All Pets page without needing a separate text index.
petSchema.index({ name: 1 });
petSchema.index({ species: 1 });

export default mongoose.model("Pet", petSchema);
