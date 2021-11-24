const defaultTheme = require('tailwindcss/defaultTheme')

/**
 * https://github.com/tailwindlabs/tailwindcss/discussions/1077#discussioncomment-528222
 *
 * @type {import("@types/tailwindcss/tailwind-config").TailwindConfig }
 */
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
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
        header: 100,
        'menu-accordion': 80,
        modal: 150,
        overlay: 140,
        'context-menu': 200,
        toast: 1000,
      },
      fontSize: {
        xxs: '.6rem',
      },
      height: {
        header: '60px',
        main: 'calc(100vh - 60px)',
      },
      minHeight: {
        11: '2.75rem', // 44px - textarea in options.svelte
      },
      maxHeight: {
        modal: 'calc(100vh - 10rem)',
        'import-textarea': 'calc(100vh - 30rem)',
      },
      minWidth: {
        5: '1.25rem', // `window-list.svelte` image container
      },
      margin: {
        outline: '2px', // to allow space for focus ring outline
      },
      outline: {
        selected: ['2px solid #000', '-2px'],
        'selected-white': ['2px solid #fff', '-2px'],
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['focus'],
      outline: ['dark'],
    },
  },
  plugins: [],
}
