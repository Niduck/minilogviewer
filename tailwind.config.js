/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        //cyan is the default color of Flowbite; Instead of writing a custom theme the colors are ajusted here.
        'cyan': {
          '50': '#f0f1f2',
          '100': '#e1e3e6',
          '200': '#b8bcc2',
          '300': '#91959e',
          '400': '#484a54',
          '500': '#08080a',
          '600': '#07070a',
          '700': '#050508',
          '800': '#020205',
          '900': '#020205',
          '950': '#010103'
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

