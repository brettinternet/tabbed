const CracoEsbuildPlugin = require('craco-esbuild')
const { ProvidePlugin } = require('webpack')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

/**
 * Craco extends CRA internals
 */
module.exports = {
  devServer: (config) => ({
    ...config,
    writeToDisk: true,
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
    ],
  },
  // https://tailwindcss.com/docs/guides/create-react-app
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
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
