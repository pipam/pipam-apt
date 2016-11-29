'use strict';

const { splitOutputString } = require('./utils');
const { exec, asyncFor } = require('then-utils');
const { Readable: ReadableStream } = require('stream');
const pkgInfo = require('./info');

class ListStream extends ReadableStream {
  constructor(listType) {
    super({
      objectMode: true
    });
    this.list = null;
    this.userList = null;
    this.listI = 0;
    this.listType = listType;
    this.inCb = false;
    this.listPromise = exec('dpkg --get-selections | grep -v deinstall').then(({ stdout }) => {
      this.list = splitOutputString(stdout);

      // neat shell trick courtesy of geekosaur (https://superuser.com/users/70094/geekosaur)
      // on SuperUser; originally from http://superuser.com/a/253468
      return exec(`comm -13 <(gzip -dc /var/log/installer/initial-status.gz | sed -n 's/^Package: //p' | sort) <(comm -23 <(dpkg-query -W -f='\${Package}\n' | sed 1d | sort) <(apt-mark showauto | sort) )`, {
        shell: '/bin/bash'
      });
    }).then(({ stdout }) => {
      this.userList = String(stdout).split('\n');
    }).catch(err => {
      console.log(err.stack);
    });
    this.listPromiseHandlerAdded = false;
  }
  _read() {
    const cb = () => {
      this.inCb = true;
      if (this.listI === this.list.length) return this.push(null);
      const item = this.list[this.listI];
      switch (this.listType) {
        case 0:
          // Detailed
          pkgInfo(item, {
            skipInstalledCheck: true,
            skipUpToDateCheck: false
          }).then(obj => {
            if (this.userList.includes(obj.name)) {
              obj.categories = ['User'];
            } else {
              obj.categories = ['System'];
            }
            const shouldContinue = this.push(obj);
            this.listI++;
            if (shouldContinue) return cb();
            this.inCb = false;
          }, err => {
            const shouldContinue = this.push({
              name: item,
              displayName: item,
              description: 'Failed to fetch description',
              version: 'unknown'
            });
            this.listI++;
            if (shouldContinue) return cb();
            this.inCb = false;
          });
          break;
        case 1:
          // Simple
          const obj = {
            name: item,
            displayName: item,
            description: '',
            version: 'unknown',
            installed: true,
            upToDate: true
          };
          const shouldContinue = this.push(obj);
          this.listI++;
          if (shouldContinue) return cb();
          break;
      }
    };
    if (this.list) {
      if (!this.inCb) cb();
    } else if (!this.listPromiseHandlerAdded) {
      this.listPromise.then(cb);
      this.listPromiseHandlerAdded = true;
    }
  }
}

module.exports = () => new ListStream();
