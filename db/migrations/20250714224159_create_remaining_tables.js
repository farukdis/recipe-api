/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('instructions', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('step_text').notNullable();
      table.integer('step_number').notNullable();
      table.uuid('recipe_id').notNullable();
      
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
    })
    .createTable('comments', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('comment_text').notNullable();
      table.uuid('user_id').notNullable();
      table.uuid('recipe_id').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
    })
    .createTable('favorites', function (table) {
      table.uuid('user_id').notNullable();
      table.uuid('recipe_id').notNullable();
      table.primary(['user_id', 'recipe_id']);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('favorites')
    .dropTableIfExists('comments')
    .dropTableIfExists('instructions');
};