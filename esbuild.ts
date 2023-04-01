import * as esbuild from 'esbuild'

import * as env from './env'

const isProd = env.IS_PROD

const options: esbuild.BuildOptions = {
  entryPoints: ['src/background/index.ts'],
  bundle: true,
  minify: isProd,
  sourcemap: true,
  target: ['chrome58', 'firefox57'],
  outdir: 'build/background',
  logLevel: 'info',
  define: Object.entries(env).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: JSON.stringify(value) }),
    {}
  ),
}

if (isProd) {
  void esbuild.build(options)
} else {
  void esbuild.context(options).then((context) => context.watch())
}
