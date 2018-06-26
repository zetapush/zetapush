const reporters = require('jasmine-reporters');

const junitReporter = new reporters.JUnitXmlReporter({
  savePath: __dirname,
  consolidateAll: true,
});

jasmine.getEnv().addReporter(junitReporter);
