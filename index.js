import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import connectDB from "./config/db.js";
import petRoutes from "./routes/petRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";


const app = express();
const port = process.env.PORT || 5000;


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


app.all("/api/auth/*", toNodeHandler(auth));


app.use(express.json());

app.get("/", (req, res) => {
  res.send("🐾 Pet Adoption Platform API is running");
});

app.use("/api/pets", petRoutes);
app.use("/api/requests", requestRoutes);

app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});


connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
