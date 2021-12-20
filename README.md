# Tabbed

Organize your browser sessions and tabs.

## Privacy

See this extension's [Privacy Policy](./PRIVACYPOLICY.md).

## Develop

### Setup

```
npm install
```

### Run

```
npm start
```

#### Chrome

Navigate to `chrome://extensions`, enable "Developer mode", select "Load unpacked" and open the `dist/` folder. See [Chrome's developer instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/).

#### Firefox

Navigate to `about:debugging`, select "This Firefox", "Load Temporary Addon-on..." and open the `dist/` folder. See [Firefox's Extension Workshop](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

### Test

```
npm test
```

### Notes

- [Differences between API implementations](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Differences_between_API_implementations)
- [Browser support for JavaScript APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)
- [rollup-plugin-chrome-extension supports Firefox >=v89](https://github.com/extend-chrome/rollup-plugin-chrome-extension#%EF%B8%8F-what-about-firefox-support)

### Related issues

- [Safari support](https://github.com/mozilla/webextension-polyfill/issues/234)

<!--
TODO:
fix move
fix scroll x axis with tab
clean up backend, make more functional?
  windows/tabs with id are active? otherwise remove when saved?
combine windows
combine tabs - turn into group?
animate slide to previous history sessions https://www.framer.com/docs/examples/
copy to clipboard https://github.com/chakra-ui/chakra-ui/blob/main/packages/hooks/src/use-clipboard.ts
tree shake unused icons (see build/media)
preview tab with captureTab ? https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/captureTab
 -->

<!--
https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/interactive-elements/interactive-elements-app.jsx
https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/board/board.jsx
https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/board/column.jsx
https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/primatives/quote-list.jsx
-->
