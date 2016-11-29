'use strict';

const {
  packageList,
  install,
  installLogs,
  uninstallLogs,
  uninstall,
  info,
  update,
  updateLogs
} = require('./lib');

module.exports = {
  properties: {
    emitsProgressEvents: false,
    isSearchable: false,
    isLoggable: true,
    categories: ['User', 'System']
  },
  packageList,
  install,
  installLogs,
  uninstallLogs,
  uninstall,
  info,
  update,
  updateLogs
};
