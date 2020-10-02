/**
 * Created by n.vinayakan on 06.06.17.
 */
//tslint:disable-next-line
export const isBrowser = new Function(
  "try {return this===window;}catch(e){ return false;}"
)();
//tslint:disable-next-line
export const isWorker = new Function(
  "try {return this===self && typeof importScripts !== 'undefined';}catch(e){return false;}"
)();
//tslint:disable-next-line
export const isNode =
  typeof global !== "undefined" &&
  typeof process !== "undefined" &&
  typeof process.stdout !== "undefined";

const U = undefined as unknown;
type U = undefined;

export function env<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = process.env[name];
  return envValue || defaultValue;
}

export function envInt<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = process.env[name];
  return envValue ? parseInt(envValue) : defaultValue;
}

export function envFloat<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = process.env[name];
  return envValue ? parseFloat(envValue) : defaultValue;
}
export function envBoolean<T = U>(name: string, defaultValue: T = U as T) {
  const envValue = process.env[name];
  return envValue ? envValue === "true" : defaultValue;
}
export function envJson<T = U>(name: string, defaultValue: T = U as T): any {
  const envValue = process.env[name];
  if (envValue) {
    try {
      return JSON.parse(envValue);
    } catch (e) {}
  }
  return defaultValue;
}
