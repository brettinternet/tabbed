import { rm } from 'fs/promises'
import { resolve } from 'path'

const projectRoot = resolve(__dirname, '..')
const buildPath = resolve(projectRoot, 'build')
const queue = [
  resolve(buildPath, 'asset-manifest.json'),
  // for now until i18n is supported
  resolve(buildPath, '_locales'),
]

void Promise.all(
  queue.map(async (item) => {
    rm(item, { recursive: true, force: true })
  })
)
