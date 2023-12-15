import sourceMap from 'source-map-support'
sourceMap.install()
import { env, envInt } from '@01/env'
process.env.APP_TRACE_NAME = env('APP_NAME', '') + '-web'

import * as fs from 'fs'
import * as ngrok from '@ngrok/ngrok'
import { logVar } from './utils'
import { Express } from 'express'
import app from './app'
import { Server } from 'http'
import { AddressInfo } from 'net'

let prevAppInstance: Express
let prevServer: Server
let isDev = false
type ServerOptions = { NODE_ENV?: string; PORT?: number }

export class ExpressServer {
  private promise: Promise<Express>

  port: number
  host: string

  constructor({ NODE_ENV = 'development', PORT = 3000 }: ServerOptions = {}) {
    const nodeEnv = env('NODE_ENV', NODE_ENV)
    process.env.NODE_ENV = nodeEnv
    isDev = nodeEnv === 'development'
    logVar('NODE_ENV:', nodeEnv)
    this.port =
      envInt('npm_package_config_api_port') ||
      envInt('NODE_PORT') ||
      envInt('PORT') ||
      PORT
    this.host = '0.0.0.0'
    process.env.NODE_RUNTIME_PORT = this.port.toString()
    logVar('NODE_PORT:', this.port)

    this.promise = app.create()
    this.init()
  }
  async init() {
    const appInstance = await this.promise
    prevAppInstance = appInstance
    appInstance.set('port', this.port)
    this.startServer(appInstance)
  }
  ready() {
    return this.promise
  }
  get app() {
    return prevAppInstance
  }
  get server() {
    return prevServer
  }

  startServer(appInstance: Express) {
    console.log('Starting http(s) server...')
    // Listen the server
    prevServer = appInstance.listen(this.port, this.host, async () => {
      const addressInfo: AddressInfo = prevServer.address() as AddressInfo
      const host = addressInfo.address
      if (process.env.DYNO) {
        console.log('This is on Heroku..!!')
        fs.openSync('/tmp/app-initialized', 'w')
      }
      console.log('\n ✈️ Express server listening at %s:%s', host, this.port)
      const ngrokAuthToken = env('NGROK_TOKEN')
      if (isDev && ngrokAuthToken) {
        try {
          await ngrok.authtoken(ngrokAuthToken)
          const url = await ngrok.connect(this.port)
          console.log('|###################################################|')
          console.log('|                                                   |')
          console.log('|        COPY & PASTE NGROK URL BELOW:              |')
          console.log('|                                                   |')
          console.log('|          ' + url + '                |')
          console.log('|                                                   |')
          console.log('|###################################################|')

          console.log('=====')
          console.log(
            'Visit the Actions on Google console at http://console.actions.google.com'
          )
          console.log('Replace the webhook URL in the Actions section with:')
          console.log('    ' + url + '/smarthome')

          console.log('In the console, set the Authorization URL to:')
          console.log('    ' + url + '/oauth')

          console.log('')
          console.log('Then set the Token URL to:')
          console.log('    ' + url + '/token')
          console.log('')

          console.log("Finally press the 'TEST DRAFT' button")
        } catch (e) {
          console.log('ngrok error', e)
        }
      }
    })
    manageSockets(prevServer)
    return prevServer
  }
}

// TCP Socket keeper
let sockets = new Map()
let nextSocketId = 0
function manageSockets(server) {
  server.on('connection', socket => {
    const socketId = nextSocketId++
    sockets.set(socketId, socket)
    socket.on('close', () => {
      sockets.delete(socketId)
    })
  })
}

function closeAllConnections() {
  sockets.forEach(socket => {
    try {
      socket.destroy()
    } catch (e) {
      console.log(e)
    }
  })
  sockets.clear()
}

if (isDev) {
  if (module['hot']) {
    module['hot'].accept('./app', function () {
      console.log('app.ts updated')
      console.log('Closing old http sever...')
      const addressInfo: AddressInfo = prevServer.address() as AddressInfo
      prevServer.close(() => {
        console.log('Old http sever closed')
        let app = require('./app').default
        app.create().then(appInstance => {
          prevAppInstance = appInstance
          appInstance.set('port', addressInfo.port)

          // Listen the server
          prevServer = appInstance.listen(
            addressInfo.port,
            addressInfo.address,
            function () {
              console.log(
                `\n ✈️  Express server reloaded on port ${addressInfo.port}\n`
              )
            }
          )
          manageSockets(prevServer)
        })
      })
      closeAllConnections()
    })
  }
}
