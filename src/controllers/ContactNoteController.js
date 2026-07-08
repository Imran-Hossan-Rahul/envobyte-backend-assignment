import db from "../config/database.js";


//Updates the personal note for a specific contact
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { personal_note } = req.body;

    await db("contacts").where({ id }).update({ personal_note });

    const updatedContact = await db("contacts").where({ id }).first();
    res.json({ data: updatedContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update personal note" });
  }
};
