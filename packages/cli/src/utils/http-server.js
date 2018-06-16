// Native
const util = require('util');
const fs = require('fs');
const { Transform } = require('stream');
const http = require('http');
// Packages
const handler = require('serve-handler');
// Other
const { experimental } = require('../utils/log');

/**
 * Create and run http server
 * @param {Object} command
 * @param {Object} config
 */
const createServer = (command, config) => {
  experimental('Create HTTP Server');
  const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/zeit/serve-handler#options
    const stat = util.promisify(fs.stat);
    const replacement = ` data-zp-sandboxid="${
      config.appName
    }" data-zp-platform-url="${config.platformUrl}`;
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
                    size: stats.size + replacement.length,
                  })
                : stats,
          ),
        createReadStream(filepath) {
          experimental('Inject appName and platformUrl');
          const stream = fs.createReadStream(filepath);
          const template = new Transform({
            transform(chunk, encoding, callback) {
              const HTML_PATTERN = /<[hH][tT][mM][lL]([ \w\-\=\"\']*)>/gi;
              let content = chunk.toString();
              if (filepath.endsWith('.html') && HTML_PATTERN.test(content)) {
                content = content.replace(
                  HTML_PATTERN,
                  (markup, attributes, position, html) =>
                    `<html${attributes}${replacement}>`,
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
  server.listen(3000, () => experimental('Running at http://localhost:3000'));
};

module.exports = { createServer };
