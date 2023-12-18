///<reference path="./env.d.ts"/>
/**
 * Created by n.vinayakan on 06.06.17.
 */
const U = undefined as unknown
type U = undefined

import { isNode } from './runtime'

export function env(name: string, defaultValue?: string) {
  let value
  if (!isNode && typeof window !== 'undefined' && window.ENV) {
    value = window.ENV && window.ENV[name]
  } else if (typeof process !== 'undefined' && process.env) {
    value = process.env[name]
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
