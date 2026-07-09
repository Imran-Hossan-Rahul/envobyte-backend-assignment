import db from "../config/database.js";


/**
 * Returns summary statistics for the contacts.
 * Uses a single, efficient raw SQL query to calculate all metrics concurrently,
 * completely avoiding memory overload (O(1) memory complexity).
 */
export const getContactStats = async (req, res) => {
  try {
    const accountId = req.user.account_id;

    // Running a single efficient query to get all 3 statistics at once
    const [stats] = await db("contacts")
      .join("vaults", "contacts.vault_id", "vaults.id")
      .where("vaults.account_id", accountId)
      .select(
        db.raw("COUNT(contacts.id) as total_contacts"),
        db.raw(
          "SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorite_contacts",
        ),
        db.raw(
          "SUM(CASE WHEN personal_note IS NOT NULL AND personal_note != '' THEN 1 ELSE 0 END) as contacts_with_notes",
        ),
      );

    // Returning data in a consistent JSON format matching Monica's conventions
    res.json({
      data: {
        total_contacts: Number(stats.total_contacts) || 0,
        favorite_contacts: Number(stats.favorite_contacts) || 0,
        contacts_with_notes: Number(stats.contacts_with_notes) || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact statistics" });
  }
};
