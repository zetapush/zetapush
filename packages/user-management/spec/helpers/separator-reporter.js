function log(str) {
  var con = global.console || console;
  if (con && con.log) {
    con.log(str);
  }
}

var wordwrap = function(str, options) {
  options = options || {};
  if (str == null) {
    return str;
  }

  var width = options.width || 50;
  var indent = typeof options.indent === 'string' ? options.indent : '';

  var newline = options.newline || '\n' + indent;
  var escape = typeof options.escape === 'function' ? options.escape : identity;

  var regexString = '.{1,' + width + '}';
  if (options.cut !== true) {
    regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }

  var re = new RegExp(regexString, 'g');
  var lines = str.match(re) || [];
  var result =
    indent +
    lines
      .map(function(line) {
        if (line.slice(-1) === '\n') {
          line = line.slice(0, line.length - 1);
        }
        return escape(line);
      })
      .join(newline);

  if (options.trim === true) {
    result = result.replace(/[ \t]*$/gm, '');
  }
  return result;
};

function identity(str) {
  return str;
}

SeparatorReporter = function() {
  var self = this;
  var currentSuites = [];
  // const oldConsole = console.log;

  self.jasmineStarted = function(summary) {};
  self.suiteStarted = function(suite) {
    // log('');
    // log('='.repeat(20) + ' SUITE ' + '='.repeat(20));
    // log('');
    // log('');
    currentSuites.push(suite.description);
  };
  self.specStarted = function(spec) {
    var wrapped = wordwrap(currentSuites.join(' ') + ' ' + spec.description, { width: 64 }).split('\n');
    log('┌───────────────────────────────────────────────────────────────────┐');
    wrapped.forEach((line) => {
      log('| ' + line.padEnd(65, ' ') + ' |');
    });
    log('└───────────────────────────────────────────────────────────────────┘');
  };
  self.specDone = function(spec) {
    // log('-'.repeat(47));
    // log('');
    // // console.log = oldConsole;
    // log('-'.repeat(47));
    // log('');
  };
  self.suiteDone = function(suite) {
    // log('');
    // log('');
    // log('='.repeat(47));
    // log('');
    currentSuites.pop();
  };
  self.jasmineDone = function() {};
};

module.exports = SeparatorReporter;
