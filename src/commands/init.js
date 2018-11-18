const {Command} = require('@oclif/command')
const { getKnex } = require('../knex')
const { cli } = require('cli-ux')
const chalk = require('chalk')
const uuid = require('uuid')

class InitCommand extends Command {
  async run() {

    const knex = await getKnex()

    this.log('Creating User Table')
    await knex.schema.dropTableIfExists('user')
    await knex.schema.createTable('user', table => {
      table.uuid('id').primary()
      table.string('name').unique().notNull()
      table.boolean('active').default(true)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
    
    this.log('Creating Note Table')
    await knex.schema.dropTableIfExists('note')
    await knex.schema.createTable('note', table => {
      table.uuid('id').primary()
      table
        .string('user_id')
        .references('id')
        .inTable('user')
      table
        .string('standup_id')
        .references('id')
        .inTable('standup')
      table.json('data')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
    
    this.log('Creating Standup Table')
    await knex.schema.dropTableIfExists('standup')
    await knex.schema.createTable('standup', table => {
      table.uuid('id').primary()
      table.json('duration')
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })
    
    this.log('Creating Config Table')
    await knex.schema.dropTableIfExists('config')
    await knex.schema.createTable('config', table => {
      table.uuid('id').primary()
      table.string('name').unique()
      table.json('config')
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })

    // slack related stuff
    try {

      const hook = await cli.prompt('Please enter slack hook')
      const channel = await cli.prompt('Please enter slack channel')
      
      await knex('config').insert({
        id: uuid(),
        name: 'slack',
        config: JSON.stringify({
          hook,
          channel
        })
      })

      this.log(chalk.green('Slack config set! \n'))


      let askAgain = true
      let users = []
      this.log('Add some team members! Type \'q\' to finish')
      while(askAgain){
        const user = await cli.prompt('Name')
        if(user === 'q'){
          askAgain = false
        }
        if(askAgain)
        {
          users.push(user)
        }
      }

      await knex('user').insert(users.map(name => ({
        id: uuid(),
        name,
      })))

      this.log(chalk.green('Successfully added', users.join(', ')))
      this.log('Run', chalk.bold('scrum start'), 'to begin.')

    } catch(e){
      this.log(e)
    }



    this.exit(1)
    // const {flags} = this.parse(InitCommand)
    // const name = flags.name || 'world'
    // this.log(`hello ${name} from /Users/matt/io/cli/scrum/src/commands/init.js`)
  }
}

InitCommand.description = `Describe the command here
...
Extra documentation goes here
`

// InitCommand.flags = {
//   name: flags.string({char: 'n', description: 'name to print'}),
// }

module.exports = InitCommand

/* 

exports.seed = async knex => {
  // USER
  await knex.schema.dropTableIfExists('user')
  await knex.schema.createTable('user', table => {
    table.uuid('id').primary()
    table.string('name').notNull()
    table.boolean('active').default(true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
  await knex('user').insert(userNames.map(name => ({ id: uuid(), name })))

  // NOTES
  await knex.schema.dropTableIfExists('note')
  await knex.schema.createTable('note', table => {
    table.uuid('id').primary()
    table
      .string('user_id')
      .references('id')
      .inTable('user')
    table
      .string('standup_id')
      .references('id')
      .inTable('standup')
    table.json('data')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  // STANDUP
  await knex.schema.dropTableIfExists('standup')
  await knex.schema.createTable('standup', table => {
    table.uuid('id').primary()
    table.json('duration')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  const users = await knex('user').select('id')

  const standupId = uuid()

  await knex('standup').insert({
    id: standupId,
    duration: JSON.stringify({ minutes: 1, seconds: 5 })
  })

  for (let user of users) {
    await knex('note').insert([
      {
        id: uuid(),
        user_id: user.id,
        standup_id: standupId,
        data: JSON.stringify(userNote),
        created_at: getDateOffsetDays(-1)
      }
    ])
  }
}

*/