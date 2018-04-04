const cwd = require('resolve-cwd');
const read = require('read-pkg');

const bootstrap = (id) =>
  read(id).then(({ zetapush }) => {
    const path = cwd(id);
    const Api = require(path);
    return {
      Api,
      zetapush,
    };
  });

module.exports = bootstrap;
