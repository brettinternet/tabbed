// the craco overwrite in devServer's writeToDisk doesn't copy public files to build
import { cp } from 'fs/promises'
import { resolve } from 'path'

const projectRoot = resolve(__dirname, '..')

void cp(resolve(projectRoot, 'public'), resolve(projectRoot, 'build'), {
  recursive: true,
  force: false,
  errorOnExist: true,
})
