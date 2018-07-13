function log(str) {
  var con = global.console || console;
  if (con && con.log) {
    con.log(str);
  }
}

SeparatorReporter = function() {
  var self = this;
  // const oldConsole = console.log;

  self.jasmineStarted = function(summary) {};
  self.suiteStarted = function(suite) {
    log('');
    log('='.repeat(20) + ' SUITE ' + '='.repeat(20));
    log('');
    log('');
  };
  self.specStarted = function(spec) {
    log('');
    log('-'.repeat(20) + ' SPEC  ' + '-'.repeat(20));
    // console.log = (...args) => oldConsole('   ', ...args);
    log('');
  };
  self.specDone = function(spec) {
    log('');
    // console.log = oldConsole;
    log('-'.repeat(46));
    log('');
  };
  self.suiteDone = function(suite) {
    log('');
    log('');
    log('='.repeat(46));
    log('');
  };
  self.jasmineDone = function() {};
};

jasmine.getEnv().addReporter(new SeparatorReporter());
