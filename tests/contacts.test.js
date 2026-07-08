import request from "supertest";
import app from "../src/server.js";
import db from "../src/config/database.js";

describe("Contact Feature Tests", () => {
  let testContactId;

  // Setup: Fetch an existing contact ID from the database before running tests
  beforeAll(async () => {
    const contact = await db("contacts").first();
    if (contact) {
      testContactId = contact.id;
    }
  });

  // Teardown: Close the database connection after all tests complete
  // This prevents Jest from hanging open due to active connection pools
  afterAll(async () => {
    await db.destroy();
  });

  // Feature Test 1: Mark a contact as favorite
  it("Should mark a contact as favorite", async () => {
    // Skip test gracefully if the database is completely empty
    if (!testContactId) return;

    // Send POST request to mark the contact as a favorite
    const res = await request(app).post(
      `/api/contacts/${testContactId}/favorite`,
    );

    expect(res.statusCode).toBe(200);
    // MariaDB stores booleans as TINYINT (1/0). Using toBeTruthy() handles the '1' perfectly.
    expect(res.body.data.is_favorite).toBeTruthy();
  });

  // Feature Test 2: Update a personal note
  it("Should update a personal note", async () => {
    if (!testContactId) return;

    const newNote =
      "This note was successfully updated by Jest Automated Test!";

    // Send PUT request with the updated note payload
    const res = await request(app)
      .put(`/api/contacts/${testContactId}/note`)
      .send({ personal_note: newNote });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.personal_note).toBe(newNote);
  });

  // Feature Test 3: Filter contacts using favorite=1
  it("Should filter contacts using favorite=1", async () => {
    // Pre-condition: Ensure at least one contact is marked as favorite for a robust test
    if (testContactId) {
      await request(app).post(`/api/contacts/${testContactId}/favorite`);
    }

    // Send GET request to the listing endpoint with the favorite filter applied
    const res = await request(app).get("/api/contacts?favorite=1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("meta");

    // Verify that the total count in meta is at least 1
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);

    // Verify that every returned contact actually has is_favorite set to true
    const contacts = res.body.data;
    contacts.forEach((contact) => {
      expect(contact.is_favorite).toBeTruthy();
    });
  });

  // Feature Test 4: Search contacts by name
  it("Should search contacts by name", async () => {
    // Sending GET request with a search query
    const res = await request(app).get("/api/contacts?search=Michael");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("meta");
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  // Feature Test 5: Fetch contact statistics correctly
  it("Should fetch contact statistics with correct fields", async () => {
    // Sending GET request to our highly optimized stats endpoint
    const res = await request(app).get("/api/contacts/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");

    // Verifying that all 3 required properties exist in the response
    const stats = res.body.data;
    expect(stats).toHaveProperty("total_contacts");
    expect(stats).toHaveProperty("favorite_contacts");
    expect(stats).toHaveProperty("contacts_with_notes");
  });
});
