const PEERS_MAX_NUM_CONNECTIONS_SET = 'PEERS_MAX_NUM_CONNECTIONS_SET'
const PEERS_ADDED = 'PEERS_ADDED'
const PEERS_REMOVED = 'PEERS_REMOVED'
const CONNECTION_LIFETIME_SET = 'CONNECTION_LIFETIME_SET'
const PEER_CONNECTION_LONGTERM_SET = 'PEER_CONNECTION_LONGTERM_SET'

const SCHEDULER_DID_START = 'SCHEDULER_DID_START'
const SCHEDULER_DID_STOP = 'SCHEDULER_DID_STOP'
const SCHEDULER_DID_TICK = 'SCHEDULER_DID_TICK'

const PEER_PRIORITY_SET = 'PEER_PRIORITY_SET'
const PRIORITY_HIGH = 'PRIORITY_HIGH'
const PRIORITY_MED = 'PRIORITY_MED'
const PRIORITY_LOW = 'PRIORITY_LOW'
const PRIORITY_BANNED = 'PRIORITY_BANNED'

const PEER_CONNECTION_STARTED = 'PEER_CONNECTION_STARTED'
const PEER_CONNECTION_CONNECTED = 'PEER_CONNECTION_CONNECTED'
const PEER_CONNECTION_CONNECTED_TO_US = 'PEER_CONNECTION_CONNECTED_TO_US'
const PEER_CONNECTION_ERROR = 'PEER_CONNECTION_ERROR'
const PEER_CONNECTION_CLOSED = 'PEER_CONNECTION_CLOSED'

function peersMaxConnectionsSet (max) {
  return {
    type: PEERS_MAX_NUM_CONNECTIONS_SET,
    payload: max
  }
}

function peersAdded (peers) {
  return {
    type: PEERS_ADDED,
    payload: peers
  }
}

module.exports = {
  PEERS_MAX_NUM_CONNECTIONS_SET,
  peersMaxConnectionsSet,
  PEERS_ADDED,
  peersAdded

}
