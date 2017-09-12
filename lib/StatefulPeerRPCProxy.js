'use strict'

const Base = require('grenache-nodejs-base')
const Ws = require('grenache-nodejs-ws')
const Http = require('grenache-nodejs-http')

class StatefulPeerRPCProxy extends Base.PeerRPCServer {
  init () {
    super.init()
    switch (this.conf.proxyType) {
      case 'WS':
        this.server = new Ws.PeerRPCServer(this.link, this.conf)
        break
      case 'HTTP':
        this.server = new Http.PeerRPCServer(this.link, this.conf)
        break
      default:
        throw new Error('Unsupported proxy type: ' + this.conf.proxyType)
    }
    this.server.init()
  }

  transport (dest, opts = {}) {
    let t = this.server.transport(dest, opts)
    t.on('request', (rid, key, payload, handler) => {
      if (payload) {
        if (payload.startsWith('WS:')) {
          this.client = new Ws.PeerRPCClient(this.link, {})
          this.client.init()
          this.proxiedService = payload.substr('WS:'.length)
          handler.reply(null, 'Started proxying ' + this.proxiedService)
        } else if (payload.startsWith('HTTP:')) {
          this.client = new Http.PeerRPCClient(this.link, {})
          this.client.init()
          this.proxiedService = payload.substr('HTTP:'.length)
          handler.reply(null, 'Started proxying ' + this.proxiedService)
        } else if (payload === 'STOP') {
          this.client.stop()
          this.client = null
          handler.reply(null, 'Stopped proxying ' + this.proxiedService)
          this.proxiedService = null
        } else if (this.client) {
          this.client.request(this.proxiedService, payload, { timeout: 10000 }, (err, data) => {
            console.log('Response from', this.proxiedService, err, data)
            handler.reply(err, data)
          })
        } else {
          handler.reply(new Error('no service is proxied'), null)
        }
      }
    })
    return t
  }
}

module.exports = StatefulPeerRPCProxy
