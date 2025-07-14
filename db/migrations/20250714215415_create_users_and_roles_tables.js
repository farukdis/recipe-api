/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('roles', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
    })
    .createTable('users', function (table) {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('username', 50).notNullable().unique();
      table.string('email', 100).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('profile_picture_url', 255);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('user_roles', function (table) {
      table.uuid('user_id').notNullable();
      table.uuid('role_id').notNullable();
      table.primary(['user_id', 'role_id']);
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('roles');
};