module.exports = function Connector (connectToPeer) {
  var peers = {}

  return {
    connect: function (multiserverAddress, cb) {
      connectToPeer(multiserverAddress, function (err, connection) {
        if (err) {
          console.log('ERROR connecting to', multiserverAddress)
          return cb(err)
        }

        console.log('CONNECTED to', multiserverAddress)

        peers[multiserverAddress] = connection || {
          close: function (cb) {
            console.log('Dummy connection closing')
            cb()
          }
        }

        cb(null)
      })
    },
    disconnect: function (multiserverAddress, cb) {
      if (!peers[multiserverAddress]) return cb(new Error('Peer not connected'))
      console.log('DISCONNECTED from:', multiserverAddress)
      peers[multiserverAddress].close(cb)
      delete peers[multiserverAddress]
    }
  }
}
