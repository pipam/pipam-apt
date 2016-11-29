'use strict';

const streams = require('./logStreams');

module.exports = (pkg) => {
  if (streams.uninstall === null) return Promise.reject(new Error('Nope.'));
  return Promise.resolve(streams.uninstall);
};
