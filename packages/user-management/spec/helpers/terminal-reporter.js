const reporters = require('jasmine-reporters');

const reporter = new reporters.TerminalReporter({
  verbosity: 3,
  color: true,
  showStack: true
});

jasmine.getEnv().addReporter(reporter);
