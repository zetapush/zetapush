// Native
const util = require('util');
const fs = require('fs');
const stat = util.promisify(fs.stat);
const { Transform } = require('stream');
const http = require('http');
// Packages
const handler = require('serve-handler');
// Other
const { info } = require('@zetapush/common');

/**
 * Create and run http server
 * @param {Object} command
 * @param {Object} config
 * @param {number} port
 */
const createServer = (name, path, config, port) => {
  const injected = ` data-zp-sandboxid="${config.appName}" data-zp-platform-url="${config.platformUrl}"`;
  info('Create HTTP Server');
  const server = http.createServer((request, response) => {
    return handler(
      request,
      response,
      {
        public: path
      },
      {
        stat: (filepath) =>
          stat(filepath).then(
            (stats) =>
              filepath.endsWith('.html')
                ? Object.assign(stats, {
                    size: stats.size + injected.length
                  })
                : stats
          ),
        createReadStream(filepath) {
          const stream = fs.createReadStream(filepath);
          // Transform only html files to inject ZetaPush context in html data attributes
          if (filepath.endsWith('.html')) {
            const template = new Transform({
              transform(chunk, encoding, callback) {
                const HTML_PATTERN = /<[hH][tT][mM][lL]([ \w\-\=\"\']*)>/gi;
                let content = chunk.toString();
                if (HTML_PATTERN.test(content)) {
                  content = content.replace(
                    HTML_PATTERN,
                    (markup, attributes, position, html) => `<html${attributes}${injected}>`
                  );
                }
                this.push(content);
                callback();
              }
            });
            return stream.pipe(template);
          }
          return stream;
        }
      }
    );
  });
  return new Promise((resolve, reject) => {
    try {
      server.listen(port, () => {
        info(`${name} is running at http://localhost:${port}`);
        resolve(port);
      });
    } catch (failure) {
      reject(failure);
    }
  });
};

module.exports = { createServer };
