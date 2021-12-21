/**
 * For scripts built with esbuild: background scripts only
 * https://github.com/evanw/esbuild/issues/1374#issuecomment-861801905
 */

export var process = {
  env: new Proxy(
    {},
    {
      APP_NAME: 'Tabbed', // process.env.APP_NAME,
      SAVE_SESSIONS: true,
    }
  ),
}
