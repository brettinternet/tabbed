const defaultTheme = require('tailwindcss/defaultTheme')

/**
 * https://github.com/tailwindlabs/tailwindcss/discussions/1077#discussioncomment-528222
 *
 * @type {import("@types/tailwindcss/tailwind-config").TailwindConfig }
 */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    screens: {
      xxs: '320px',
      xs: '481px',
      // existing breakpoints: https://tailwindcss.com/docs/responsive-design
      // extending screens: https://tailwindcss.com/docs/breakpoints#extending-the-default-breakpoints
      ...defaultTheme.screens,
    },
    extend: {
      zIndex: {
        'tab-actions': 10,
        header: 100,
        modal: 150,
        overlay: 140,
        menu: 200,
        toast: 1000,
      },
      fontSize: {
        xxs: '.6rem',
      },
      height: {
        header: '3.2rem',
        'window-header': '5.5rem',
        'window-column': 'calc(100vh - 3.2rem - .4rem)', // screen - header - scrollbar width (x-axis)
        tab: '5.5rem',
        'tab-list': 'calc(100vh - 9.1rem)', // screen - header - window-header - scrollbar width (x-axis)
        'modal-header': '5.2rem',
        'modal-drawer-body': 'calc(100vh - 5.2rem)', // screen - modal-header
      },
      maxHeight: {
        modal: 'calc(100vh - 10rem)',
        'import-textarea': 'calc(100vh - 30rem)',
        'tab-list': 'calc(100vh - 9.1rem)', // screen - header - window-header - scrollbar width (x-axis)
      },
      minHeight: {
        'tab-list': 'calc(100vh - 9.1rem)', // screen - header - window-header - scrollbar width (x-axis)
      },
      minWidth: {
        32: '8rem' /* 128px */, // dropdown menu item
      },
      margin: {
        outline: '2px', // to allow space for focus ring outline
      },
      outline: {
        selected: ['2px solid #000', '-2px'],
        'selected-white': ['2px solid #fff', '-2px'],
      },
      padding: {
        header: '3.2rem',
      },
    },
  },
  variants: {
    extend: {
      textColor: ['disabled'],
      borderWidth: ['focus'],
      outline: ['dark'],
      display: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
