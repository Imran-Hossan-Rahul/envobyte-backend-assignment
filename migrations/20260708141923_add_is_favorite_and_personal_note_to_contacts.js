/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable("contacts", function (table) {
    table.boolean("is_favorite").defaultTo(false);
    table.text("personal_note").nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable("contacts", function (table) {
    table.dropColumn("is_favorite");
    table.dropColumn("personal_note");
  });
}
