// routes/petRoutes.js
import { Router } from "express";
import Pet from "../models/Pet.js";
import AdoptionRequest from "../models/AdoptionRequest.js";
import verifyAuth from "../middleware/verifyAuth.js";

const router = Router();

// ---- Public: All Pets — search by name ($regex), filter by species ($in), sort ----
router.get("/", async (req, res) => {
  try {
    const { search, species, sort, hideAdopted } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (species) {
      const speciesList = species.split(",").filter(Boolean);
      if (speciesList.length) query.species = { $in: speciesList };
    }

    if (hideAdopted === "true") {
      query.adopted = { $in: [false, null] };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "fee_asc") sortOption = { adoptionFee: 1 };
    if (sort === "fee_desc") sortOption = { adoptionFee: -1 };
    if (sort === "age_asc") sortOption = { age: 1 };
    if (sort === "age_desc") sortOption = { age: -1 };

    const pets = await Pet.find(query).sort(sortOption);
    res.send(pets);
  } catch (error) {
    res.status(500).send({ message: "Failed to load pets", error: error.message });
  }
});

// ---- Public: featured pets for the homepage ----
router.get("/featured", async (req, res) => {
  try {
    const pets = await Pet.find({ adopted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(6);
    res.send(pets);
  } catch (error) {
    res.status(500).send({ message: "Failed to load featured pets", error: error.message });
  }
});

// ---- Private: pets belonging to the logged-in owner ----
router.get("/mine", verifyAuth, async (req, res) => {
  try {
    const pets = await Pet.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
    res.send(pets);
  } catch (error) {
    res.status(500).send({ message: "Failed to load your listings", error: error.message });
  }
});

// ---- Public: single pet details ----
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).send({ message: "Pet not found" });
    res.send(pet);
  } catch (error) {
    res.status(400).send({ message: "Invalid pet id" });
  }
});

// ---- Private: add a pet listing ----
router.post("/", verifyAuth, async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      age,
      gender,
      image,
      healthStatus,
      vaccinationStatus,
      location,
      adoptionFee,
      description,
    } = req.body;

    const pet = await Pet.create({
      name,
      species,
      breed,
      age,
      gender,
      image,
      healthStatus,
      vaccinationStatus,
      location,
      adoptionFee,
      description,
      ownerEmail: req.user.email, // never trust the client for this
      ownerName: req.user.name,
    });

    res.status(201).send(pet);
  } catch (error) {
    res.status(400).send({ message: "Failed to add pet", error: error.message });
  }
});

// ---- Private: update a pet listing (owner only) ----
router.patch("/:id", verifyAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).send({ message: "Pet not found" });
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden: you don't own this listing" });
    }

    const {
      name,
      species,
      breed,
      age,
      gender,
      image,
      healthStatus,
      vaccinationStatus,
      location,
      adoptionFee,
      description,
    } = req.body;

    Object.assign(pet, {
      name,
      species,
      breed,
      age,
      gender,
      image,
      healthStatus,
      vaccinationStatus,
      location,
      adoptionFee,
      description,
    });

    await pet.save();
    res.send(pet);
  } catch (error) {
    res.status(400).send({ message: "Failed to update pet", error: error.message });
  }
});

// ---- Private: delete a pet listing (owner only) ----
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).send({ message: "Pet not found" });
    if (pet.ownerEmail !== req.user.email) {
      return res.status(403).send({ message: "Forbidden: you don't own this listing" });
    }

    await pet.deleteOne();
    await AdoptionRequest.deleteMany({ petId: pet._id });

    res.send({ message: "Pet listing deleted" });
  } catch (error) {
    res.status(400).send({ message: "Failed to delete pet", error: error.message });
  }
});

export default router;
