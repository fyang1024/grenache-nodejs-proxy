// make sure you start 2 grapes
// grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
// grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const StatefulPeerRPCProxy = Grenache.StatefulPeerRPCProxy

const _ = require('lodash')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

// const peer = new StatefulPeerRPCProxy(link, {proxyType: 'WS'})
const peer = new StatefulPeerRPCProxy(link, {proxyType: 'HTTP'})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('stateful_rpc_proxy', service.port, {})
}, 1000)
