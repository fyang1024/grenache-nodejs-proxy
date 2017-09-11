'use strict'

const Base = require('grenache-nodejs-base')
const Ws = require('grenache-nodejs-ws')
const Http = require('grenache-nodejs-http')

class PeerRPCProxy extends Base.PeerRPCServer {

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
        throw new Error("Unsupported proxy type: " + this.conf.proxyType)
    }
    this.server.init()
  }

  transport (dest, opts = {}) {
    let t = this.server.transport(dest, opts)
    t.on('request', (rid, key, payload, handler) => {
      switch(payload.serviceType) {
        case 'WS':
          this.client = new Ws.PeerRPCClient(this.link, {})
          break
        case 'HTTP':
          this.client = new Http.PeerRPCClient(this.link, {})
          break
        default:
          throw new Error('Unsupported service type: ' + payload.serviceType)
      }
      this.client.init()
      this.client.request(payload.service, payload.payload, { timeout: 10000 }, (err, data) => {
        handler.reply(err, data)
      })
    })
    return t
  }

}

module.exports = PeerRPCProxy
