const { getKnex } = require('./knex')
const axios = require('axios')

exports.formatNotesMessage = (notes) => {
  let msg = '```'
  msg += new Date().toLocaleDateString() + '\n'
  for (let { name, data } of notes) {
    msg += `${name.toUpperCase()}: \n`
    msg += `Yesterday: ${data.yesterday}\n`
    msg += `Today: ${data.today}\n`
    msg += `Blocked / Challenged: ${data.blocked || ''}\n\n\`\`\``
  }
  return msg
}

const getConfig = async name => {
  try {
    const knex = await getKnex()
    const [{ config }] = await knex('config').where({ name })
    return JSON.parse(config)
  } catch (e) {
    console.log('Couldnt get config for', name)
  }
}

exports.createSlackAlert = async text => {
  try {
    const { hook, channel } = await getConfig('slack')

    if (!hook || !channel) return

    await axios({
      method: 'post',
      url: hook,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        channel: `#${channel}`,
        username: `Standup Notes`,
        icon_emoji: ':squid:',
        text
      }
    });

  } catch (e) {
    console.log('Uh Oh, Slack error', e)
  }
}