const { Command, flags } =require( '@oclif/command')
const { shuffle, repeat } =require( 'lodash')
const {cli} =require('cli-ux')
const chalk =require( 'chalk')
const uuid = require('uuid');

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./dev.sqlite3",
  }
});

class StartCommand extends Command {
  // description = 'An Interactive Scrum Tool.'

  // flags = {
  //   help: flags.help({ char: 'h' }),
  // }

  async getNoteYesterday(id) {
    try {
      const [{ data: lastNote } = {}] = await knex('note')
        .where('user_id', id)
        .orderBy('created_at')
        .limit(1)
      if (!lastNote) {
        return 'No notes for yesterday.'
      }
      return JSON.parse(lastNote).yesterday
    } catch (e) {
      this.log('Error getting yesterday', id)
    }
  }

  async saveNotes(notes) {
    try {
      for (const note of notes) {
        const notesArray = notes.map((note) => ({
          id: uuid(),
          user_id: note.userId,
          data: JSON.stringify(note.data),
          created_at: Date.now(),
          updated_at: Date.now(),
        }))
        await knex('note')
          .insert(notesArray)
      }
    } catch (e) {
      console.log(e)
      this.log('Error saving notes')
      this.log(notes)
    }
  }

  async ask(member) {
    let note = {};
    const yesterdaysNote = await this.getNoteYesterday(member.id)
    const yesterdayRevised = await cli.prompt(`${chalk.blue(member.name)} yesterday (${chalk.italic(yesterdaysNote)})`, { required: false });
    note.yesterday = yesterdayRevised || yesterdaysNote
    note.today = await cli.prompt(`${chalk.blue(member.name)} today`);
    note.blocked = await cli.prompt(`${chalk.blue(member.name)} blocked`, { required: false });
    this.log('\n\n')
    return note
  }

  async prompt(team) {
    let notes = []
    for (const member of team) {
      notes.push({
        userId: member.id,
        data: await this.ask(member)
      })
    }
    return notes
  }

  // adds padding to messages
  withPadding(msg, top = 2, bottom = 2) {
    this.log(repeat('\n', top), msg, repeat('\n', bottom))
  }

  async run() {

    // const { args, flags } = this.parse(Scrum)
    this.log('Lets go!')
    const start = Date.now()

    // get users, shuffle
    const team = await knex('user').where({ active: true })
    const teamShuffled = shuffle(team)
    const namesShuffled = teamShuffled.map(({ name }) => name).join(', ')
    this.withPadding(`Provably fair order today is:  ${namesShuffled}`)

    // ask all the things
    const notes = await this.prompt(teamShuffled)

    // save the notes
    await this.saveNotes(notes)

    // duration
    const mins = Math.round(((Date.now() - start) / 1000) / 60)
    const seconds = Math.round(((Date.now() - start) / 1000))
    this.log(`${mins}m ${seconds}s`)

    // done
    this.withPadding(chalk.green('Have a good day!'))
    this.exit(1);
  }
}

StartCommand.description = `Describe the command here
...
Extra documentation goes here
`

StartCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = StartCommand
