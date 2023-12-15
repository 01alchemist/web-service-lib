import * as OriginalSentry from '@sentry/node'
import chalk from 'chalk'
import { env } from '@01/env'

let isSentryEnabled = false
const {
  SENTRY_DSN = '',
  APP_VERSION = '',
  RELEASE: release = '',
  BUILD_ENV = '',
  CLUSTER_NAME = ''
} = process.env
const environment = env('NODE_ENV', 'development')
const isProd = environment === 'stage' || environment === 'production'
let warned = false
const warn = () => {
  if (warned) return
  warned = true
  console.log(
    `🚨 ${chalk.bgRed(
      chalk.bold.white(
        ' Sentry not configured properly, Check env[SENTRY_DSN] '
      )
    )}`
  )
}

if (SENTRY_DSN) {
  isSentryEnabled = true
  OriginalSentry.init({
    release,
    environment,
    dsn: SENTRY_DSN
  })
  OriginalSentry.configureScope((scope: OriginalSentry.Scope) => {
    scope.setTags({
      release,
      APP_VERSION,
      BUILD_ENV,
      environment,
      CLUSTER_NAME
    })
  })
} else {
  if (isProd) {
    warn()
  }
}
const dummyFn = () => {}
const dummy = new Proxy(
  {},
  {
    get: () => dummyFn,
    apply: () => {}
  }
)

export const Sentry = new Proxy<typeof OriginalSentry>(OriginalSentry, {
  get: (target: any, prop) => {
    if (isSentryEnabled) {
      return target[prop]
    }
    return target[prop] instanceof Function ? dummyFn : dummy
  }
})
