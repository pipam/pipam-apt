'use strict';

module.exports = {
  splitOutputString(str) {
    return String(str).split('\n').map(str => {
      let str2 = str.replace(/\s/g, ' ');
      return str2.substr(0, str2.indexOf(' '));
    });
  }
};
