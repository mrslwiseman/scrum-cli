const _ = require('lodash')
const createKnex = require('knex')

exports.getKnex = _.once(async () => {
  // const directory = await exports.migrationsDirectory.get();
  const knex = createKnex({
    client: 'sqlite3',
    connection: {
      filename: './src/scrum.sqlite3',
    }
  })
  return knex
  // migrations: {
  //   directory
  // },
})
