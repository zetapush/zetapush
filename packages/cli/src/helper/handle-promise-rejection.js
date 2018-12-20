const { warn } = require('@zetapush/common');

process.on('unhandledRejection', (reason, promise) => {
  warn('A promise rejection has not be handled', { reason, promise });
});
