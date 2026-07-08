import express from "express";


const router = express.Router();

// health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is up and running" });
});

export default router;
