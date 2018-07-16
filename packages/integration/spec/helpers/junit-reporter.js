const reporters = require('jasmine-reporters');
const os = require('os');

const junitReporter = new reporters.JUnitXmlReporter({
  savePath: __dirname,
  consolidateAll: true,
  filePrefix: `junit-${os.type()}-${os.release()}`,
});

jasmine.getEnv().addReporter(junitReporter);
