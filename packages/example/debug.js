const { Authentication, Client } = require('@zetapush/client')
const { Queue } = require('@zetapush/platform-legacy')
const NodeJSTransports = require('@zetapush/cometd/lib/node/Transports')

const client = new Client({
  platformUrl: 'http://hq.zpush.io:9080/zbo/pub/business/',
  appName: '1ev1h4iv',
  transports: NodeJSTransports,
  authentication: () => Authentication.developer({
    login: 'gregory+hq@zetapush.com',
    password: 'pwd',
  })
})

const service = client.createService({
  Type: Queue,
  listener: {
    dispatch(parameters) {
      console.log('dispatch', parameters)
    },
    configure(parameters) {
      console.log('configure', parameters)
    }
  }
})

client.addConnectionStatusListener({
  onConnectionBroken() {
    console.log('onConnectionBroken')
  },
  onConnectionEstablished() {
    console.log('onConnectionEstablished')
    console.log('register')
    service.register({
      capacity: 100,
      routing: {
        exclusive: true
      }
    })
  },
})

client.connect()
