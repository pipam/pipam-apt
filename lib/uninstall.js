'use strict';

const { default: Sudoer } = require('electron-sudo');
const streams = require('./logStreams');
const { Readable: ReadableStream } = require('stream');

const sudo = new Sudoer({
  name: 'pipam-apt'
});

module.exports = (pkg) => {
  return sudo.spawn('apt-get', ['remove', '-q', pkg]).then(child => {
    const myRef = streams.update = new ReadableStream();
    myRef._read = () => null;
    const dataHandler = chunk => myRef.push(chunk);
    let endI = 0;
    const endHandler = () => {
      endI++;
      if (endI === 2) {
        // both streams are done
        myRef.push(null);
      }
    };
    child.stdout.on('data', dataHandler);
    child.stderr.on('data', dataHandler);
    child.stdout.once('end', endHandler);
    child.stderr.once('end', endHandler);
    myRef.once('end', () => {
      // make sure that we don't remove a different stream
      if (streams.uninstall === myRef) {
        streams.uninstall = null;
      }
    });

    return new Promise((resolve, reject) => {
      child.once('exit', resolve);
      child.once('error', reject);
    });
  });
};
