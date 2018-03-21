const {createPlayer, resolveTracks, hhMMss} = require('../internal/encoder-selector.js')
const url = require('url')
const querystring = require('querystring')
module.exports = {
  meta: {
    level: 1,
    timeout: 0,
    alias: ['voice'],
    noDM: true,
    help: 'succ'
  },
  fn: async (msg, suffix) => {
    if (msg.channel.guild.channels.filter(c => c.type === 2).length === 0) {
      global.i18n.send('NO_VOICE_CHANNELS', msg.channel)
    } else if (!msg.member.voiceState.channelID) {
      global.i18n.send('JOIN_VOICE_CHANNEL', msg.channel)
    } else if (global.bot.voiceConnections.get(msg.channel.guild.id)) {
      global.i18n.send('VOICE_CONNECTED', msg.channel, {channel: msg.channel.guild.channels.find(c => c.id === global.bot.voiceConnections.get(msg.channel.guild.id).channelId).name})
    } else {
      if (suffix) {
        let link = url.parse(suffix)
        let splitLink
        if (link.hostname) {
          if (suffix.includes('list=') !== suffix.includes('playlist?')) {
            if (suffix.includes('youtu.be')) { // If the link is shortened with youtu.be
              splitLink = suffix.split('?list=') // Check for this instead of &list
              msg.channel.createMessage(`Try that again with either a link to the video or the playlist.
**Video:** <${splitLink[msg.guild.id][0]}>
**Playlist:** <https://www.youtube.com/playlist?list=${splitLink[1]}>`)
            } else {
              splitLink = suffix.split('&list=')
              msg.channel.createMessage(`Try that again with either a link to the video or the playlist.
**Video:** <${splitLink[0]}>
**Playlist:** <https://www.youtube.com/playlist?list=${splitLink[1]}>`)
            }
          } else {
            resolveTracks(suffix).then(tracks => {
              if (tracks.length === 1) {
                hhMMss(tracks[0].info.length / 1000).then(time => {
                  createPlayer(msg, tracks)
                  global.i18n.send('TRACK_ADDED', msg.channel, {
                    title: tracks[0].info.title,
                    duration: time,
                    user: msg.author.username
                  })
                })
              } else {
                createPlayer(msg, tracks)
                global.i18n.send('TRACKS_ADDED', msg.channel, {count: tracks.length, user: msg.author.username})
              }
            }).catch(console.error)
          }
        } else {
          resolveTracks(encodeURI(`ytsearch:${suffix}`)).then(tracks => {
            if (tracks.length === 0) {
              global.i18n.send('NO_TRACK_FOUND', msg.channel, {user: msg.author.mention})
            } else {
              hhMMss(tracks[0].info.length / 1000).then(time => {
                createPlayer(msg, [tracks[0]])
                global.i18n.send('TRACK_ADDED', msg.channel, {
                  title: tracks[0].info.title,
                  duration: time,
                  user: msg.author.username
                })
              })
            }
          }).catch(console.error)
        }
      } else {
        createPlayer(msg)
      }
    }
  }
}
