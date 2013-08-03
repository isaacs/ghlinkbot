var c = require('./config.js')
var IRC = require('irc.js')
var irc = new IRC(c.server, c.port)
var ghlink = require('ghlink')

var nickidx = 0
irc.on('errorcode', function(code) {
  if (code == 'ERR_NICKNAMEINUSE')
    irc.nick(c.nick + '_' + (nickidx++))
  else
    console.error(code)
})

irc.connect(c.nick)

irc.on('connected', function(server) {
  console.log('connected to ' + server)
  irc.on('privmsg', onpriv)
  irc.nick(c.nick)
  var self = this
  join(Object.keys(c.rooms))
  function join(rooms) {
    console.error('joining:', rooms)
    var r = rooms.shift()
    if (r) self.join('#' + r, function() {
      join(rooms)
    })
  }
})

function onpriv(from, to, message) {
  if (from === 'MI6')
    return

  var resp = from
  var proj = null
  if (to.charAt(0) === '#') {
    resp = to
    proj = c.rooms[to.slice(1)]
  }
  var opt = { format: 'links', project: proj }
  var links = ghlink(message, opt)
  if (links.trim()) {
    links.split('\n').forEach(function(l) {
      this.privmsg(resp, l)
    }, this)
  }
}
