class Client {
  constructor(options) {
    this.connectionType = 'websocket'
    this.ids = 0
    this.options = options
    this.listener = {
      ...(options.listener || {}),
      ...({
        '/meta/handshake': (message) => {
          this.clientId = message.clientId
          this.meta()
        },
        '/meta/connect': (message) => {
          const { advice = {} } = message
          const { timeout = 30000 } = advice
          setTimeout(() => this.meta(), timeout)
        }
      })
    }
  }
  onOpen(message) {
    console.log('open', message)
    this.send([{
      ext: {
        authentication: {
          data: {
            login: this.options.developerLogin,
            password: this.options.developerPassword
          },
          type: `${this.options.appName}.developer.developer`,
          version: 'none'
        }
      },
      id: ++this.ids,
      version: '1.0',
      minimumVersion: '1.0',
      channel: '/meta/handshake',
      supportedConnectionTypes: [this.connectionType],
      advice: {
        timeout: 60000,
        interval: 0
      }
    }])
  }
  onMessage(message) {
    const messages = JSON.parse(message.data)
    messages.forEach((message) => {
      try {
        this.listener[message.channel](message)
      } catch (error) {

      }
    })
  }
  meta(type = 'connect') {
    this.send([{
      id: ++this.ids,
      channel: `/meta/${type}`,
      connectionType: this.connectionType,
      advice: {
        timeout: 0
      },
      clientId: this.clientId
    }])
  }
  send(messages) {
    const json = JSON.stringify(messages)
    this.socket.send(json)
  }
  async connect() {
    const response = await fetch(`${this.options.apiUrl}/${this.options.appName}`);
    const { servers } = await response.json();
    const server = Client.shuffle(servers);
    const url = `${server.replace(/^http\:/, 'wss:')}/strd`;
    this.socket = new WebSocket(url);
    this.socket.onopen = this.onOpen.bind(this)
    this.socket.onmessage = this.onMessage.bind(this)
  }
  static shuffle(list) {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
  static isMetaChannel(channel) {
    return /^\/meta/.test(channel)
  }
}
const client = new Client({
  apiUrl: 'https://zbo.zpush.io/zbo/pub/business',
  appName: 'TVND3n2y',
  developerLogin: 'leocare@zetapush.com',
  developerPassword: 'zH2sNveGLBVSzdJG',
  listener: {
    '/service/TVND3n2y/macro_0/trace': ({ data }) => {
      console.log('trace', data)
    }
  }
})
client.connect()