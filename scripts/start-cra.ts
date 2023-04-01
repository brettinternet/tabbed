import { spawn } from 'child_process'
import { resolve } from 'path'

const cwd = resolve(__dirname, '..')

/**
 * Because CRA refuses to allow users from preventing console clearing
 * https://github.com/facebook/create-react-app/issues/2495
 *
 * This is the cross-platform equivalent to piping to `cat`
 */
const start = spawn('npx', ['craco', 'start'], {
  shell: true,
  cwd,
})
start.stdout.pipe(process.stdout)
start.stderr.pipe(process.stderr)
