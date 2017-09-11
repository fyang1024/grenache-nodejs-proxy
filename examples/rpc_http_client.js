'use strict'

const Http = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Peer = Http.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const reqs = 1
let reps = 0

setTimeout(() => {
  const d1 = new Date()
  for (let i = 0; i < reqs; i++) {
    peer.request('rpc_proxy_test', {serviceType: 'WS', service: 'rpc_test', payload: 'Hello'}, { timeout: 10000 }, (err, data) => {
      if (err) {
        console.error(err)
        process.exit(-1)
      }
      console.log(err, data)
      if (++reps === reqs) {
        const d2 = new Date()
        console.log(d2 - d1)
      }
    })
  }
}, 2000)
