const {Command, flags} = require('@oclif/command')

class ConfigCommand extends Command {
  async run() {
    const {flags} = this.parse(ConfigCommand)
    const name = flags.name || 'world'
    this.log(`hello ${name} from /Users/matt/io/cli/scrum/src/commands/config.js`)
  }
}

ConfigCommand.description = `Describe the command here
...
Extra documentation goes here
`

ConfigCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = ConfigCommand
