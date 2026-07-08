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

/**
 * Fetches a paginated list of contacts with dynamic sorting and filtering.
 * Supports filtering by favorite status and keyword search across multiple name fields.
 * I clone the query builder for counting to avoid duplicating any filter logic.
 */
export const getContacts = async (req, res) => {
  try {
    // 1. Extract query parameters with smart default values
    const { page = 1, limit = 15, sort = "first_name", favorite, search } = req.query;

    // 2. Initialize the base database query
    const query = db("contacts");

    // 3. Apply the Favorite filter if explicitly requested (?favorite=1)
    if (favorite === "1") {
      query.where("is_favorite", true);
    }

    // 4. Apply the Search filter across multiple fields
    if (search) {
      query.where(function () {
        this.where("first_name", "like", `%${search}%`)
          .orWhere("last_name", "like", `%${search}%`)
          .orWhere("nickname", "like", `%${search}%`);
      });
    }

    // 5. Clone the current query state to fetch the total count for pagination metadata
    const countQuery = query.clone();
    const [{ total }] = await countQuery.count("* as total");

    // 6. Apply sorting and offset for pagination to the main query
    const offset = (page - 1) * limit;
    const contacts = await query.orderBy(sort, "asc").limit(Number(limit)).offset(Number(offset));

    // 7. Return the structured response matching Monica's API standard
    res.json({
      data: contacts,
      meta: {
        current_page: Number(page),
        per_page: Number(limit),
        total: Number(total),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact list" });
  }
};