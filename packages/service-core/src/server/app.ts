import express from 'express'
import session from 'express-session'
import compression from 'compression'
import bodyParser from 'body-parser'
import { genRandomString, isOriginAllowed, logVar } from './utils'
import { HttpStatus } from './utils/request'
import { swagger } from './components/auto-router'
import { env, envJson } from '@01/env'
import { logger } from './components/logger'

const isDev = env('NODE_ENV', 'development') === 'development'

const corsWhitelist = envJson('CORS_WHITELIST') ?? ['*']

// App Version
logVar('APP_VERSION', env('APP_VERSION'))

//Express
let app = express()
app.use(compression())

if (isDev) {
  process.env.DEBUG = '*'
} else {
  // Redirect http traffic to https
  app.get('*', redirectToHttps)
}

function redirectToHttps(req, res, next) {
  logger.info('x-forwarded-proto:', req.headers['x-forwarded-proto'])
  if (req.headers['x-forwarded-proto'] != 'https') {
    res.redirect('https://' + req.hostname + req.url)
  } else {
    next()
  }
}

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' })) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support url encoded bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('trust proxy', 1) // trust first proxy
app.use(
  session({
    genid: () => {
      return genRandomString()
    },
    secret: 'xyzsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)
app.set('jsonp callback name', 'cid')

// Custom headers
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  if (process.env.MAX_AGE_GENERAL) {
    res.header('Cache-Control', `max-age=${process.env.MAX_AGE_GENERAL}`)
  }
  return next()
})

function corsDelegate(req, res, next) {
  const origin = req.header('Origin')
  if (origin !== undefined) logger.info('Origin:' + origin)
  if (
    corsWhitelist.indexOf('*') !== -1 ||
    isOriginAllowed(origin, corsWhitelist)
  ) {
    next()
  } else {
    res.status(HttpStatus.FORBIDDEN).json({ message: 'Not allowed by CORS' })
  }
}

app.use('/', corsDelegate)

app.use(function onError(error, _, res, __) {
  logger.error('Unhandled error')
  console.error(error)
  res
    .status(500)
    .json({ code: 500, message: error.message, sentryId: res.sentry })
})

export default {
  create: async () => {
    await swagger.register({ app })
    return app
  }
}

logger.info('\n\nRegistered routes:')
app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    logger.info(r.route.path)
  }
})

if (module['hot']) {
  module['hot'].dispose(function () {
    logger.info('Disposed app.ts')
  })
  logger.info('HMR signal')
}
