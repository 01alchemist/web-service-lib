import { WebpackNodeConfig } from '@01/core-utils'

const entries = {
  index: ['./src/index.ts']
}

const baseDir = __dirname
const baseConfig = WebpackNodeConfig({
  baseDir,
  entries,
  type: 'library'
})

export default baseConfig
