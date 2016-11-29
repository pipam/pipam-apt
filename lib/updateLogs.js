'use strict';

const streams = require('./logStreams');

module.exports = (pkg) => {
  if (streams.update === null) return Promise.reject(new Error('Nope.'));
  return Promise.resolve(streams.update);
};
