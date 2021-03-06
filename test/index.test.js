var test = require('tape')
var Store = require('../store')
var { RouteRecord } = require('../routes/')
var {Map} = require('immutable')

var {PRIORITY_MED, PRIORITY_HIGH} = require('../types')
var {
  DISCONNECTED,
  CONNECTED,
  CONNECTING
} = require('../routes/types')

function connectToPeer (address) {

}

test('simple', function (t) {
  var app = Store({connectToPeer})
  t.ok(app, 'app is a thing')
  t.end()
})

test('throws if connectToPeer not passed in opts', function (t) {
  t.throws(() => Store({}), 'throws')
  t.end()
})

test('Set Max Peers', function (t) {
  var app = Store({connectToPeer})
  var expected = 5
  app.doSetMaxNumConnections(expected)

  var newState = app.selectMaxConnectedPeers(app.getState())
  t.equal(newState, expected, 'Peers rtc max is set')
  t.end()
})

test('Adds a peer', function (t) {
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var address = `rtc:hello.com:8091~shs:${peerId}`
  var peerAddress = {
    address
  }
  app.doAddPeer(peerAddress)
  var peer = app.selectPeers(app.getState()).get(peerId)
  t.ok(peer, 'peer was added')
  t.equal(peer.id, peerId, 'peer has id set to the pub key')

  t.end()
})

test('remove peer', function (t) {
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var address = `rtc:hello.com:8091~shs:${peerId}`
  var peerAddress = {
    address
  }
  app.doAddPeer(peerAddress)
  var peer = app.selectPeers(app.getState()).get(peerId)
  t.ok(peer, 'new peer was added')

  app.doRemovePeer(peerAddress)
  peer = app.selectPeers(app.getState()).get(peerId)
  t.false(peer)

  t.end()
})

test('connecting to a route immediately updates to CONNECTING and eventually CONNECTED on success', function (t) {
  t.plan(2)
  function connectToPeer (address, cb) {
    var connectionState = app.selectRoutes(app.getState()).getIn([address, 'connectionState'])
    t.equal(connectionState, CONNECTING)
    cb(null)
    connectionState = app.selectRoutes(app.getState()).getIn([address, 'connectionState'])
    t.equal(connectionState, CONNECTED)
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  app.doAddRoute({multiserverAddress})
  app.doRoutesConnect([multiserverAddress])
})

test('connecting to a route immediately dispatches CONNECTING and eventually DISCONNECTED on error', function (t) {
  t.plan(2)
  function connectToPeer (address, cb) {
    var connectionState = app.selectRoutes(app.getState()).getIn([address, 'connectionState'])
    t.equal(connectionState, CONNECTING)
    cb(new Error('zzzzt'))
    connectionState = app.selectRoutes(app.getState()).getIn([address, 'connectionState'])
    t.equal(connectionState, DISCONNECTED)
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)
  app.doRoutesConnect([multiserverAddress])
  t.end()
})

test('isLocal is set for a local route', function (t) {
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress,
    isLocal: true
  }
  app.doAddRoute(payload)
  var isLocal = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'isLocal'])
  t.ok(isLocal, 'route is local')
  t.end()
})

test('on peer connection, the correct route has lastConnectionTime set to now', function (t) {
  t.plan(1)
  var tickAmount = 12345
  function connectToPeer (multiserverAddress, cb) {
    cb(null)
    var lastConnectionTime = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'lastConnectionTime'])

    var expectedConnectionTime = tickAmount + now

    t.equal(lastConnectionTime, expectedConnectionTime) // division is just to allow for differences in times
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  var now = app.selectAppTime(app.getState())
  app.doAddRoute(payload)
  app.doSchedulerTick(tickAmount)
  app.doRoutesConnect([multiserverAddress])
  t.end()
})

test('on peer connection, the correct route has connection count incremented by one', function (t) {
  t.plan(2)
  function connectToPeer (multiserverAddress, cb) {
    var connectionCount = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'connectionCount'])
    t.equal(connectionCount, 0) // division is just to allow for differences in times
    cb(null)
    connectionCount = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'connectionCount'])
    t.equal(connectionCount, 1) // division is just to allow for differences in times
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)
  app.doRoutesConnect([multiserverAddress])
  t.end()
})

test('on peer connection error, the errors array has the error added', function (t) {
  t.plan(1)
  var expectedErrorString = 'BANG'

  function connectToPeer (multiserverAddress, cb) {
    cb(new Error(expectedErrorString))
    var errors = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'errors'])
    t.equal(errors.first(), expectedErrorString)
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)
  app.doRoutesConnect([multiserverAddress])
  t.end()
})

test('set priority on a route', function (t) {
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)
  app.doSetRoutePriority(payload, PRIORITY_MED)

  var priority = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'priority'])

  t.equal(priority, PRIORITY_MED, 'route priority is set')

  app.doSetRoutePriority(payload, PRIORITY_HIGH)

  priority = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'priority'])

  t.equal(priority, PRIORITY_HIGH, 'route priority is updated')

  t.end()
})

test('set peer isLongterm', function (t) {
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)

  var isLongterm = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'isLongterm'])
  t.equal(isLongterm, false, 'longterm is set')

  app.doSetRouteLongtermConnection(payload, true)

  isLongterm = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'isLongterm'])
  t.equal(isLongterm, true, 'longterm is set')

  t.end()
})

test('routes that are connected longer than conneciton lifetime get disconnected, unless there is only one connection', function (t) {
  t.plan(4)

  var address1 = createAddress(1)
  var address2 = createAddress(2)
  function connectToPeer (multiserverAddress, cb) {
    cb(null)
    var connectionState = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'connectionState'])
    t.equal(connectionState, CONNECTED)
  }
  var app = Store({connectToPeer})
  var payload = {
    multiserverAddress: address1
  }

  app.doAddRoute(payload)
  app.doRoutesConnect([address1])
  app.doSetConnectionLifetime(1000)

  app.doSchedulerTick(2000)

  setTimeout(function () {
    var connectionState = app.selectRoutes(app.getState()).getIn([address1, 'connectionState'])
    t.equal(connectionState, CONNECTED, 'stay connected with only 1 peer')
    app.doAddRoute({multiserverAddress: address2})
    app.doRoutesConnect([address2])
    app.doSchedulerTick(2000)
    setTimeout(function () {
      var connectionState = app.selectRoutes(app.getState()).getIn([address1, 'connectionState'])
      t.equal(connectionState, DISCONNECTED, 'the oldest one is disconnected')
    }, 1)
  }, 1)
})

test('scheduler makes connections when started and disconnects when scheduler is stopped', function (t) {
  t.plan(2)
  function connectToPeer (multiserverAddress, cb) {
    cb(null)
    var connectionState = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'connectionState'])
    t.equal(connectionState, CONNECTED, 'scheduler made the connection on start')
    app.doStopScheduler()

    setTimeout(function () {
      connectionState = app.selectRoutes(app.getState()).getIn([multiserverAddress, 'connectionState'])
      t.equal(connectionState, DISCONNECTED, 'scheduler closed the connection on stop')
    }, 1)
  }
  var app = Store({connectToPeer})
  var peerId = 'DTNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ='
  var multiserverAddress = `rtc:hello.com:8091~shs:${peerId}`
  var payload = {
    multiserverAddress
  }
  app.doAddRoute(payload)
  app.doStartScheduler(100)
})

test('selectDisconnectedRoutesWithoutRecentErrors', function (t) {
  var address1 = createAddress(1)
  var address2 = createAddress(2)
  var address3 = createAddress(3)

  var route1 = RouteRecord({
    id: address1
  })

  var route2 = RouteRecord({
    id: address2,
    connectionState: CONNECTING
  })

  var route3 = RouteRecord({
    id: address3,
    lastErrorTime: 1
  })

  var state = Map({
    [address1]: route1,
    [address2]: route2,
    [address3]: route3
  })

  var app = Store({connectToPeer, routes: {initialState: state}})
  var result = app.selectDisconnectedRoutesWithoutRecentErrors(state)
  t.true(result.get(address1))
  t.false(result.get(address2))
  t.false(result.get(address3))
  t.end()
})

test('selectDisconnectedRoutesWithRecentErrors', function (t) {
  var address1 = createAddress(1)
  var address2 = createAddress(2)
  var address3 = createAddress(3)

  var route1 = RouteRecord({
    id: address1
  })

  var route2 = RouteRecord({
    id: address2,
    connectionState: CONNECTING
  })

  var route3 = RouteRecord({
    id: address3,
    lastErrorTime: 1
  })

  var state = Map({
    [address1]: route1,
    [address2]: route2,
    [address3]: route3
  })

  var app = Store({connectToPeer, routes: {initialState: state}})
  var result = app.selectDisconnectedRoutesWithRecentErrors(state)
  t.false(result.get(address1))
  t.false(result.get(address2))
  t.true(result.get(address3))
  t.end()
})

test('selectNextRoutesToConnectTo', function (t) {
  var address1 = createAddress(1)
  var address2 = createAddress(2)
  var address3 = createAddress(3)
  var address4 = createAddress(4)
  var address5 = createAddress(5)

  // highest
  var route1 = RouteRecord({
    id: address1,
    isLongterm: true,
    lastErrorTime: 2
  })

  // prefer routes that we haven't connected to for the longest time
  var route2 = RouteRecord({
    id: address2
  })

  // prefer routes that we haven't connected to for the longest time. This one has the most recent connnection time
  var route3 = RouteRecord({
    id: address3,
    lastConnectionTime: 3
  })

  // if they've had errors they should go to the back
  var route4 = RouteRecord({
    id: address4,
    lastErrorTime: 1
  })

  // should be missing because is already connecting
  var route5 = RouteRecord({
    id: address2,
    connectionState: CONNECTING
  })

  var state = Map({
    [address1]: route1,
    [address2]: route2,
    [address3]: route3,
    [address4]: route4,
    [address5]: route5
  })

  var app = Store({connectToPeer, routes: {initialState: state}})
  var orderedKeys = app.selectNextRoutesToConnectTo(state).keySeq()
  t.equal(orderedKeys.get(0), address1)
  t.equal(orderedKeys.get(1), address2)
  t.equal(orderedKeys.get(2), address3)
  t.equal(orderedKeys.get(3), address4)
  t.false(orderedKeys.get(4))
  t.end()
})

function createAddress (num) {
  var peerId = `${num}TNmX+4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ=`
  return `rtc:hello.com:8091~shs:${peerId}`
}
