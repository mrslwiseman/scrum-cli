const { Command, flags } = require('@oclif/command')
const { getKnex } = require('../knex')

class RemoveCommand extends Command {
  async run() {
    const { flags } = this.parse(RemoveCommand)
    const name = flags.name

    const knex = await getKnex()

    this.log('Removing ', name)

    const member = await knex('user')
      .where({ name, active: true })
      .update({ active: false })

      if (!member) {
      this.error('User does not exist', name)
      this.exit(0)
    }

    this.log(name, 'successfully removed.')
    this.exit(1)

  }
}

RemoveCommand.description = `Add a person to scrum
`

RemoveCommand.flags = {
  name: flags.string({ char: 'n', description: 'Name of team member to remove' }),
}

module.exports = RemoveCommand
