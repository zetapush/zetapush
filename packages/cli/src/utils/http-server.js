// Native
const util = require('util');
const fs = require('fs');
const stat = util.promisify(fs.stat);
const { Transform } = require('stream');
const http = require('http');
// Packages
const handler = require('serve-handler');
const findFreePort = util.promisify(require('find-free-port'));
// Other
const { experimental } = require('../utils/log');

/**
 * Create and run http server
 * @param {Object} command
 * @param {Object} config
 */
const createServer = (command, config) => {
  const injected = ` data-zp-sandboxid="${
    config.appName
  }" data-zp-platform-url="${config.platformUrl}`;
  experimental('Create HTTP Server');
  const server = http.createServer((request, response) => {
    return handler(
      request,
      response,
      {
        public: command.front,
      },
      {
        stat: (filepath) =>
          stat(filepath).then(
            (stats) =>
              filepath.endsWith('.html')
                ? Object.assign(stats, {
                    size: stats.size + injected.length,
                  })
                : stats,
          ),
        createReadStream(filepath) {
          const stream = fs.createReadStream(filepath);
          const template = new Transform({
            transform(chunk, encoding, callback) {
              const HTML_PATTERN = /<[hH][tT][mM][lL]([ \w\-\=\"\']*)>/gi;
              let content = chunk.toString();
              if (filepath.endsWith('.html') && HTML_PATTERN.test(content)) {
                content = content.replace(
                  HTML_PATTERN,
                  (markup, attributes, position, html) =>
                    `<html${attributes}${injected}>`,
                );
              }
              this.push(content);
              callback();
            },
          });
          return stream.pipe(template);
        },
      },
    );
  });
  return findFreePort(3000).then(
    (port) =>
      new Promise((resolve, reject) => {
        try {
          server.listen(port, () => {
            experimental(`Running at http://localhost:${port}`);
            resolve();
          });
        } catch (failure) {
          reject(failure);
        }
      }),
  );
};

module.exports = { createServer };
