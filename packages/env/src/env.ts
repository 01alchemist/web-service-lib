///<reference path="./env.d.ts"/>
/**
 * Created by n.vinayakan on 06.06.17.
 */
const U = undefined as unknown
type U = undefined

//@ts-nocheck
import processEnv from 'process.env'
import { isNode } from './runtime'

export function env(name: string, defaultValue?: string) {
  let value
  if (isNode) {
    value = process.env[name]
  } else {
    const dynamicEnvValue = window.ENV && window.ENV[name] // This is loaded from /public/env-conf.js
    const staticEnvValue = processEnv[name] // This one is static & will be generated during compile time
    value = dynamicEnvValue !== undefined ? dynamicEnvValue : staticEnvValue
  }
  return value !== undefined ? value : defaultValue
}

export function envInt<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = env(name)
  return envValue ? parseInt(envValue) : defaultValue
}

export function envFloat<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = env(name)
  return envValue ? parseFloat(envValue) : defaultValue
}
export function envBoolean<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = env(name)
  return envValue
    ? envValue.toLowerCase() === 'true' || envValue === '1'
    : defaultValue
}
export function envJson<T = U>(name: string, defaultValue: T = U as T): any {
  const envValue = env(name)
  if (envValue) {
    try {
      return JSON.parse(envValue)
    } catch (e) {}
  }
  return defaultValue
}
