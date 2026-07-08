import express from "express";
import { getContact, getContacts } from "../controllers/ContactController.js";
import {
  getFavorites,
  markFavorite,
  removeFavorite,
  toggleFavorite,
} from "../controllers/ContactFavoriteController.js";
import { updateNote } from "../controllers/ContactNoteController.js";


const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is up and running" });
});

// List all contacts with pagination, search, and filtering
router.get("/contacts", getContacts);

// Specific routes
router.get("/contacts/favorites", getFavorites);

// ID based routes
router.post("/contacts/:id/favorite", markFavorite);
router.delete("/contacts/:id/favorite", removeFavorite);
router.put("/contacts/:id/note", updateNote);
router.get("/contacts/:id", getContact);
router.patch("/contacts/:id/favorite", toggleFavorite);

export default router;
