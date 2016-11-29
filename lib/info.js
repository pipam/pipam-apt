'use strict';

const { exec } = require('then-utils');

module.exports = (pkg, { skipInstalledCheck = false, skipUpToDateCheck = false } = {}) => {
  const obj = {
    name: pkg,
    displayName: pkg,
    description: 'Failed to fetch description',
    version: 'unknown',
    installed: false,
    upToDate: true
  };

  let cmdProm = null;

  cmdProm = Promise.resolve();
  if (!skipInstalledCheck) {
    cmdProm = exec(`dpkg -s ${pkg}`).then(({ stdout }) => {
      stdout = String(stdout);
      if (stdout.includes('ok installed')) {
        // stdout isn't empty, some version is installed
        obj.installed = true;
      }
    }, err => {
      return Promise.resolve();
    });
  }

  cmdProm = cmdProm.then(() => {
    if (!skipUpToDateCheck) {
      return exec(`apt-get -s -q install --only-upgrade ${pkg}`).then(({ stdout, stderr }) => {
        if (String(stdout).includes('is already the newest version')) {
          obj.upToDate = true;
        }
        return;
      }, err => {
        return Promise.resolve();
      });
    }
  });

  return cmdProm.then(() => obj);
};
