// routes/requestRoutes.js
import { Router } from "express";
import AdoptionRequest from "../models/AdoptionRequest.js";
import Pet from "../models/Pet.js";
import verifyAuth from "../middleware/verifyAuth.js";

const router = Router();

// ---- Private: submit an adoption request ----
router.post("/", verifyAuth, async (req, res) => {
  try {
    const { petId, pickupDate, message } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send({ message: "Pet not found" });

    // Adoption control: owners cannot request their own pets.
    if (pet.ownerEmail === req.user.email) {
      return res.status(403).send({ message: "You can't adopt your own listed pet" });
    }

    // Adoption control: once adopted, no further requests.
    if (pet.adopted) {
      return res.status(400).send({ message: "This pet has already been adopted" });
    }

    // One pending/approved request per requester per pet.
    const existing = await AdoptionRequest.findOne({
      petId,
      requesterEmail: req.user.email,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return res.status(400).send({ message: "You already have a request for this pet" });
    }

    const request = await AdoptionRequest.create({
      petId,
      petName: pet.name,
      petImage: pet.image,
      ownerEmail: pet.ownerEmail,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      pickupDate,
      message,
      status: "pending",
    });

    res.status(201).send(request);
  } catch (error) {
    res.status(400).send({ message: "Failed to submit adoption request", error: error.message });
  }
});

// ---- Private: requests the logged-in user has submitted ----
router.get("/mine", verifyAuth, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ requesterEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.send(requests);
  } catch (error) {
    res.status(500).send({ message: "Failed to load your requests", error: error.message });
  }
});

// ---- Private: requests received for a specific pet (owner only) ----
router.get("/pet/:petId", verifyAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).send({ message: "Pet not found" });
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden: not your listing" });
    }

    const requests = await AdoptionRequest.find({ petId: req.params.petId }).sort({
      createdAt: -1,
    });
    res.send(requests);
  } catch (error) {
    res.status(400).send({ message: "Failed to load requests", error: error.message });
  }
});

// ---- Private: approve or reject a request (pet owner only) ----
router.patch("/:id", verifyAuth, async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).send({ message: "Invalid status" });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).send({ message: "Request not found" });
    if (request.ownerEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden: not your listing's request" });
    }
    if (request.status !== "pending") {
      return res.status(400).send({ message: "This request was already decided" });
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
      // Only one request can ever be accepted for a pet.
      await Pet.findByIdAndUpdate(request.petId, { adopted: true });
      await AdoptionRequest.updateMany(
        { petId: request.petId, _id: { $ne: request._id }, status: "pending" },
        { status: "rejected" }
      );
    }

    res.send(request);
  } catch (error) {
    res.status(400).send({ message: "Failed to update request", error: error.message });
  }
});

// ---- Private: cancel (delete) your own request ----
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).send({ message: "Request not found" });
    if (request.requesterEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden: not your request" });
    }

    await request.deleteOne();
    res.send({ message: "Request cancelled" });
  } catch (error) {
    res.status(400).send({ message: "Failed to cancel request", error: error.message });
  }
});

export default router;
