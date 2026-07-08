import db from "../config/database.js";


// Fetches all contacts currently marked as favorites
export const getFavorites = async (req, res) => {
  try {
    const favorites = await db("contacts").where("is_favorite", true);
    res.json({ data: favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

//marks a specific contact as a favorite
export const markFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await db("contacts").where({ id }).update({ is_favorite: true });

    const updatedContact = await db("contacts").where({ id }).first();
    res.json({ data: updatedContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark as favorite" });
  }
};

// Removes a contact from the favorites list
export const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await db("contacts").where({ id }).update({ is_favorite: false });

    const updatedContact = await db("contacts").where({ id }).first();
    res.json({ data: updatedContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

// Toggles the favorite status on/off, with a quick 404 check if the contact doesn't exist
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await db("contacts").where({ id }).first();

    if (!contact) return res.status(404).json({ error: "Contact not found" });

    const newStatus = !contact.is_favorite;
    await db("contacts").where({ id }).update({ is_favorite: newStatus });

    const updatedContact = await db("contacts").where({ id }).first();
    res.json({ data: updatedContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle favorite status" });
  }
};
