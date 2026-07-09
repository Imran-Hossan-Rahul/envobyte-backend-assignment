import express from "express";
import { getContact, getContacts } from "../controllers/ContactController.js";
import {
  getFavorites,
  markFavorite,
  removeFavorite,
  toggleFavorite,
} from "../controllers/ContactFavoriteController.js";
import { updateNote } from "../controllers/ContactNoteController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getContactStats } from "../controllers/StatisticsController.js";


const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is up and running" });
});

// List all contacts with pagination, search, and filtering
router.get("/contacts", authenticate, getContacts);

// Specific routes
router.get("/contacts/favorites", authenticate, getFavorites);

// Statistics Endpoint
router.get("/contacts/stats", authenticate, getContactStats);

// ID based routes
router.post("/contacts/:id/favorite", authenticate, markFavorite);
router.delete("/contacts/:id/favorite", authenticate, removeFavorite);
router.put("/contacts/:id/note", authenticate, updateNote);
router.get("/contacts/:id", authenticate, getContact);
router.patch("/contacts/:id/favorite", authenticate, toggleFavorite);

export default router;
