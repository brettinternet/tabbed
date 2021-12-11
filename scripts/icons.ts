import cheerio from 'cheerio'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { resolve } from 'path'

import { IconName } from '../src/components/icon/icons'

const processSvg = (markup: Buffer) => {
  const $ = cheerio.load(markup, null, false)

  // Remove width/height so it can be sized with classes
  const svg = $('svg')
  svg.removeAttr('width')
  svg.removeAttr('height')

  // Add fill as `currentColor` so it can be modified with color classes
  svg.attr('fill', 'currentColor')

  return $.xml()
}

const iconTempDir = resolve(__dirname, '..', 'icons')

const processIcons = async () => {
  await mkdir(iconTempDir, { recursive: true })

  for (const name of Object.values(IconName)) {
    // https://github.com/marella/material-design-icons
    const input = resolve(
      __dirname,
      '..',
      'node_modules',
      '@material-design-icons',
      'svg',
      'round',
      `${name}.svg`
    )
    const output = resolve(iconTempDir, `${name}.svg`)
    const content = await readFile(input)
    await writeFile(output, processSvg(content))
  }
}

void processIcons()
