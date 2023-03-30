# Tabbed

Visualize and organize your browser sessions, windows and tabs.

## Features

- [x] Quick tab actions
  - [x] Reorder and reassign to separate window with drag and drop
  - [x] Focus, close and drag to new window
  - [x] Pin with animated reorder
  - [x] Free memory
  - [x] Mute
- [x] Quick window actions
  - [x] Custom reorder with drag and drop
  - [x] Change state
  - [x] View tab count, focused window and active tab
  - [x] Focus, close and open new tab
  - [x] Incognito window support
- [x] Settings
  - [x] Theme, font size, etc
- [x] Extension popup, popout window and tab view
- [x] Shortcuts
- [x] Extension window customization - tab, popup and popout window
- [ ] Move tabs with keyboard
- [ ] Search
- [ ] View recently closed tabs/windows
- [ ] View saved sessions
- [ ] multi-tab drag and drop

## Privacy

See this extension's [Privacy Policy](./PRIVACYPOLICY.md).

## Develop

Install dependencies.

```
npm install
```

Start development server.

```
npm start
```

#### Chrome

Navigate to `chrome://extensions`, enable "Developer mode", select "Load unpacked" and open the `dist/` folder. See [Chrome's developer instructions](https://developer.chrome.com/docs/extensions/mv3/getstarted/).

#### Firefox

Navigate to `about:debugging`, select "This Firefox", "Load Temporary Addon-on..." and open the `dist/` folder. See [Firefox's Extension Workshop](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

### Notes

- [Differences between API implementations](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Differences_between_API_implementations)
- [Browser support for JavaScript APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)
- [rollup-plugin-chrome-extension supports Firefox >=v89](https://github.com/extend-chrome/rollup-plugin-chrome-extension#%EF%B8%8F-what-about-firefox-support)

### Related issues

- [Safari support](https://github.com/mozilla/webextension-polyfill/issues/234)

<!--
TODO:
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
