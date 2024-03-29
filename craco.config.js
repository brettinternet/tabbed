const CracoEsbuildPlugin = require('craco-esbuild')
const { ProvidePlugin, DefinePlugin } = require('webpack')
const path = require('path')
const env = require('./env')

const isProd = env.IS_PROD

/**
 * Craco extends CRA internals
 */
module.exports = {
  devServer: (config) => ({
    ...config,
    devMiddleware: {
      writeToDisk: true,
    },
  }),
  webpack: {
    configure: (config, { paths }) => {
      if (!isProd) {
        // Since devServer is modified, output in dev goes to `dist` dir by default
        // and ignores the `BUILD_PATH` - https://create-react-app.dev/docs/advanced-configuration
        // modifying build output: https://github.com/gsoft-inc/craco/issues/104
        paths.appBuild = config.output.path = path.resolve('build')
      }
      // For new versions of node incompatible with Framer Motion and CRA: https://github.com/framer/motion/issues/1307
      config.module.rules.push({
        type: 'javascript/auto',
        test: /\.mjs$/,
        include: /node_modules/,
      })
      return config
    },
    plugins: [
      // https://github.com/pradel/create-react-app-esbuild/issues/7
      new ProvidePlugin({
        React: 'react',
      }),
      new DefinePlugin(
        Object.entries(env).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: JSON.stringify(value) }),
          {}
        )
      ),
    ],
  },
  plugins: [
    {
      // https://github.com/pradel/create-react-app-esbuild/blob/main/packages/craco-esbuild/README.md
      plugin: CracoEsbuildPlugin,
      options: {
        enableSvgr: true,
        esbuildMinimizerOptions: {
          target: 'esnext',
          css: true,
        },
        skipEsbuildJest: true,
      },
    },
  ],
}
