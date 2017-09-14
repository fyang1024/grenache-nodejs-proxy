'use strict'

const Base = require('grenache-nodejs-base')
const Ws = require('grenache-nodejs-ws')
const Http = require('grenache-nodejs-http')

class StatefulPeerRPCProxy extends Base.PeerRPCServer {

  constructor (link, conf = {}) {
    super(link, conf)
    this.proxiedServices = new Map()
  }

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
        if (payload.startsWith('WS:') || payload.startsWith('HTTP:')) {
          let link = this.link
          let announcement = setInterval(function() {
            link.announce(payload, t.port, {})
          }, 1000)
          this.proxiedServices.set(payload, announcement)
          handler.reply(null, 'Started proxying ' + payload)
        } else if (payload.startsWith('STOP ')) {
          let proxiedService = payload.substr('STOP '.length)
          clearInterval(this.proxiedServices.get(proxiedService))
          this.proxiedServices.delete(proxiedService)
          handler.reply(null, 'Stopped proxying ' + proxiedService)
        } else if (this.proxiedServices.get(key)) {
          let client, proxiedService
          if(key.startsWith('WS:')) {
            client = new Ws.PeerRPCClient(this.link, {})
            proxiedService = key.substr('WS:'.length)
          } else if(key.startsWith('HTTP:')) {
            client = new Http.PeerRPCClient(this.link, {})
            proxiedService = key.substr('HTTP:'.length)
          }
          client.init()
          client.request(proxiedService, payload, { timeout: 10000 }, (err, data) => {
            console.log('Response from', proxiedService, err, data)
            handler.reply(err, data)
          })
        } else {
          handler.reply(new Error(key + ' is not proxied'), null)
        }
      }
    })
    return t
  }
}

module.exports = StatefulPeerRPCProxy
