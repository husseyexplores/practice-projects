module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1992d4',
        'brand-blue-light': '#5eb3e1',
        'brand-blue-dark': '#1475aa',
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    borderColor: ['responsive', 'hover', 'focus', 'active'],
    borderWidth: ['responsive', 'hover', 'focus', 'active'],
    margin: ['responsive', 'not-last-child'],
  },
  plugins: [
    function({ addVariant, e }) {
      addVariant('first-child', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.${e(`first-child${separator}${className}`)}:first-child`
        )
      })
    },
    function({ addVariant, e }) {
      addVariant('last-child', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.${e(`last-child${separator}${className}`)}:last-child`
        )
      })
    },
    function({ addVariant, e }) {
      addVariant('not-first-child', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.${e(
              `not${separator}first-child${separator}${className}`
            )}:not(:first-child)`
        )
      })
    },
    function({ addVariant, e }) {
      addVariant('not-last-child', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.${e(
              `not${separator}last-child${separator}${className}`
            )}:not(:last-child)`
        )
      })
    },
  ],
}
