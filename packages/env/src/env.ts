///<reference path="./env.d.ts"/>
/**
 * Created by n.vinayakan on 06.06.17.
 */
import { isNode } from './runtime'

type DefaultReturnType<T, U> = T extends U ? T : undefined

export function env<T extends string | undefined>(
  name: string,
  defaultValue?: T
) {
  let value
  if (!isNode && typeof window !== 'undefined' && window.ENV) {
    value = window.ENV && window.ENV[name]
  } else if (typeof process !== 'undefined' && process.env) {
    value = process.env[name]
  }
  return value !== undefined
    ? value
    : (defaultValue as DefaultReturnType<T, string>)
}

export function envInt<T extends number | undefined>(
  name: string,
  defaultValue?: T
) {
  const envValue = env(name)
  return envValue
    ? parseInt(envValue)
    : (defaultValue as DefaultReturnType<T, number>)
}

export function envFloat<T extends number | undefined>(
  name: string,
  defaultValue?: T
) {
  const envValue = env(name)
  return envValue
    ? parseFloat(envValue)
    : (defaultValue as DefaultReturnType<T, number>)
}

export function envBoolean<T extends boolean | undefined>(
  name: string,
  defaultValue?: T
) {
  const envValue = env(name)
  return envValue
    ? envValue.toLowerCase() === 'true' || envValue === '1'
    : (defaultValue as DefaultReturnType<T, boolean>)
}

export function envJson(name: string, defaultValue?: any): any {
  const envValue = env(name)
  if (envValue) {
    try {
      return JSON.parse(envValue)
    } catch (e) {}
  }
  return defaultValue
}
