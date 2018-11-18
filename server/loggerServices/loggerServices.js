const fs = require('fs');

var pathDate = (date) => {
  return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getUTCFullYear();
}
var fileTime = (date) => {
  return date.getHours() + ':' + date.getMinutes() + ':' + ((date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds());
}

module.exports = {
  write: (data) => {
    const datainfile = fileTime(new Date()) + ':=>' + data + '\n';
    let path = './logs/logfile-' + pathDate(new Date()) +'.txt';
    fs.appendFile(path, datainfile, (err) => {
      if (err) throw err;
    });
  },
  writeStackTrace: (data, stack) => {
    const stackarr = stack.split('\n');
    const datainfile = fileTime(new Date()) + ':=>' + data + '\n';
    let path = './logs/logfile-' + pathDate(new Date()) +'.txt';
    fs.appendFile(path, datainfile, (err) => {
      if (err) throw err;
    })
    for (let i = 0; i < stackarr.length; i++) {
      fs.appendFile(path, stackarr[i] + '\n', (err) => {
        if (err) throw err;
      })
    }
  }
}
