/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('recipes', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('title', 255).notNullable();
      table.text('description');
      table.text('image_url');
      table.integer('prep_time');
      table.integer('cook_time');
      table.integer('servings');
      table.uuid('user_id').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
    .createTable('ingredients', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name', 255).notNullable();
      table.string('quantity', 50);
      table.uuid('recipe_id').notNullable();
      
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ingredients')
    .dropTableIfExists('recipes');
};