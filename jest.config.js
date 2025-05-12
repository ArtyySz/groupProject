module.exports = {
  silent: true, // отключение вывода в консоль
};

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;