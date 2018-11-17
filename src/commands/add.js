const { Command, flags } = require('@oclif/command')
const { getKnex } = require('../knex')
const uuid = require('uuid')

class AddCommand extends Command {
  async run() {
    const { flags } = this.parse(AddCommand)
    const name = flags.name

    const knex = await getKnex()

    this.log('Adding', name)

    const [member] = await knex('user').where({ name })

    if (member) {
      this.error('User already exists with name', name)
      this.exit(0)
    }

   await knex('user').insert({
      id: uuid(),
      name
    })

    this.log('Successfully added', name)
    this.exit(1)
  }
}

AddCommand.description = `Add a person to scrum
`

AddCommand.flags = {
  name: flags.string({ char: 'n', description: 'Name of team member to add' }),
}

module.exports = AddCommand
