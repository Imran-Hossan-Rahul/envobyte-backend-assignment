import db from "../config/database.js";


// Fetches a single contact and wraps it in a 'data' object to strictly match Monica's API convention
export const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await db("contacts").where({ id }).first();

    if (!contact) return res.status(404).json({ error: "Contact not found" });

    res.json({ data: contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
};
