/* eslint-disable no-trailing-spaces */
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

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

// The following block is to test stateless rpc proxy

// peer.request('rpc_proxy', {serviceType: 'WS', service: 'coffee', payload: 'Hello'}, {timeout: 10000}, (err, data) => {
//   if (err) {
//     console.error(err)
//     process.exit(-1)
//   }
//   console.log(err, data)
// })

// The following block is to test stateful rpc proxy

sleep(1000).then(() => {
  peer.request('stateful_rpc_proxy', 'WS:coffee', {timeout: 10000}, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    console.log(err, data)
  })
  return sleep(1000)
}).then(() => {
  peer.request('stateful_rpc_proxy', 'Hello', {timeout: 10000}, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    console.log(err, data)
  })
  return sleep(1000)
}).then(() => {
  peer.request('stateful_rpc_proxy', 'STOP', {timeout: 10000}, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    console.log(err, data)
  })
  return sleep(1000)
}).then(() => {
  peer.request('stateful_rpc_proxy', 'Hello', {timeout: 10000}, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    console.log(err, data)
  })
})

