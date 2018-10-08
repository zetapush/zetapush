const reporters = require('jasmine-reporters');
const os = require('os');
const SeparatorReporter = require('./separator-reporter');

const junitReporter = new reporters.JUnitXmlReporter({
  savePath: __dirname,
  consolidateAll: true,
  filePrefix: `junit-${os.type()}-${os.release()}`
});

const reporter = new reporters.TerminalReporter({
  verbosity: 3,
  color: true,
  showStack: true
});

jasmine.getEnv().addReporter(junitReporter);
jasmine.getEnv().addReporter(reporter);
jasmine.getEnv().addReporter(new SeparatorReporter());
