const uuid = require('uuid');
const {getDateOffsetDays} = require('../src/helpers');
const userNames = ['Matt']
// const userNames = ['Matt', 'Jan', 'George', 'Sam']

const userNote = {
  yesterday: 'worked on stuff',
  today: 'finish work i didnt do yesterday',
  blocked: 'always'
}

exports.seed = async knex => {
  // USER
  await knex.schema.dropTableIfExists('user')
  await knex.schema.createTable('user', table => {
    table.uuid('id').primary();
    table.string('name').notNull();
    table.boolean('active').default(true);
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
  await knex('user')
    .insert(userNames.map(name => ({ id: uuid(), name })))

  // NOTES
  await knex.schema.dropTableIfExists('note')
  await knex.schema.createTable('note', table => {
    table.uuid('id').primary();
    table.string('user_id').references('id').inTable('user');
    table.string('standup_id').references('id').inTable('standup');
    table.json('data');
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  // STANDUP
  await knex.schema.dropTableIfExists('standup')
  await knex.schema.createTable('standup', table => {
    table.uuid('id').primary();
    table.json('duration');
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  const users = await knex('user').select('id')

  const standupId = uuid();

  await knex('standup').insert({
    id: standupId,
    duration: JSON.stringify({minutes: 1, seconds: 5})
  })

  for (let user of users) {
    await knex('note').insert([{
      id: uuid(),
      user_id: user.id,
      standup_id: standupId,
      data: JSON.stringify(userNote),
      created_at: getDateOffsetDays(-1)
    }])
  }
};
