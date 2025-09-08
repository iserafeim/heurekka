// Polyfills for Jest environment

// TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util')

Object.assign(global, { TextDecoder, TextEncoder })

// Fetch API polyfill
if (!global.fetch) {
  global.fetch = require('jest-fetch-mock')
}

// URL polyfill
if (!global.URL.createObjectURL) {
  Object.defineProperty(global.URL, 'createObjectURL', {
    value: jest.fn(),
  })
}

if (!global.URL.revokeObjectURL) {
  Object.defineProperty(global.URL, 'revokeObjectURL', {
    value: jest.fn(),
  })
}