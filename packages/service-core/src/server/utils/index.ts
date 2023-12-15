import * as fs from 'fs'
import * as crypto from 'crypto'
import { logger } from '../components/logger'
/**
 * Created by n.vinayakan on 12.06.17.
 */

export const PASSWORD_SALT_LENGTH = 16

export function isDirectory(path: string): boolean {
  try {
    return fs.lstatSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

export function isOriginAllowed(origin, list): boolean {
  if (origin === undefined) {
    return true
  }
  if (list.indexOf(origin) !== -1) {
    console.log('origin:' + origin + ' Allowed')
    return true
  }
  let result = /(http|https)(:\/\/)([a-zA-Z\d-])/g.exec(origin)
  let protocol = result !== null ? result[1] : ''
  let fulldomain = origin.replace(protocol + '://', '')
  let subdomains = fulldomain.split('.')
  let extension = subdomains.pop()
  let domain = subdomains.pop() + '.' + extension
  console.log('checking ' + fulldomain)
  if (list.indexOf(fulldomain) !== -1) {
    console.log('origin:' + origin + ' Allowed')
    return true
  }
  console.log('checking ' + '*.' + domain)
  if (list.indexOf('*.' + domain) !== -1) {
    console.log('origin:' + origin + ' Allowed')
    return true
  }
  console.log('checking ' + protocol + '://*.' + domain)
  if (list.indexOf(protocol + '://*.' + domain) !== -1) {
    console.log('origin:' + origin + ' Allowed')
    return true
  }
  console.log('origin:' + origin + ' Not Allowed')
  return false
}

export const genRandomString = (length = 16) =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)

export const sha512 = (
  password: string,
  salt: string
): { salt: string; passwordHash: string } => {
  const hash = crypto.createHmac('sha512', salt)
  hash.update(password)
  const passwordHash = hash.digest('hex')

  return { salt, passwordHash }
}

export const encryptPassword = (
  password: string,
  length: number = PASSWORD_SALT_LENGTH
): { salt: string; passwordHash: string } =>
  sha512(password, genRandomString(length))

export const verifyPassword = (
  password: string,
  salt: string,
  passwordHash: string
): boolean => sha512(password, salt).passwordHash === passwordHash

const padding = 20
export function logVar(name: string, value: any) {
  logger.log(`    ${name.padEnd(padding, ' ')}: `, value)
}
