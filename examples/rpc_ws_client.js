// make sure you start 2 grapes
// grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
// grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

'use strict'

const Ws = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')
const Peer = Ws.PeerRPCClient

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

// peer.request('rpc_proxy', {
//   serviceType: 'HTTP',
//   service: 'coffee',
//   payload: 'Hello'
// }, {timeout: 10000}, (err, data) => {
//   if (err) {
//     console.error(err)
//     process.exit(-1)
//   }
//   console.log(data)
// })

// The following block is to test stateful rpc proxy

sleep(1000).then(() => {
  peer.request('stateful_rpc_proxy', 'HTTP:coffee', {timeout: 10000}, (err, data) => {
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
