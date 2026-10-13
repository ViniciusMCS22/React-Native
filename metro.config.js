

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const pastaApi = path.resolve(__dirname, 'api').replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&');
const ignorarApi = new RegExp(`^${pastaApi}[\\\\/].*`);

const atual = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(atual) ? atual : atual ? [atual] : []),
  ignorarApi,
];

module.exports = config;
