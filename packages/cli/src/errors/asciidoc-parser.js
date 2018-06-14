const conditions = require('./conditions');
const { trace, log, error, info, help } = require('../utils/log');

const parse = (content) => {
  let parsed = content
    // remove asciidoctor variables
    .replace(/:relative-path:.*/g, '')
    .replace(/include::\{docdir\}\/variables.adoc\[\]\s*/g, '')
    // escape } char for chalk
    .replace(/\}/g, '\\}')
    // remove single line comment (these lines must be displayed in terminal)
    .replace(/^\/\/ /gm, '')
    // handle force new line syntax
    .replace(/ \+$/gm, '')
    // handle titles
    .replace(/^== (.+)$/gm, '{bold.underline $1}')
    .replace(/^=== (.+)$/gm, '{bold $1}')
    // handle code
    .replace(/```([^`]+)```/g, '{whiteBright.bgBlackBright $1}')
    .replace(/\[source(, ?\w+)?[^\]]*\](\n[.]([^\n]+))?(\n(={4}|-{4})\n)(.+?)(\4)/gms, 
            (_, language, __, legend, ___, ____, code) => highlight(language, legend, code))
    .replace(/`([^`]+)`/g, '{whiteBright.bgBlackBright $1}')
    // handle Admonitions
    .replace(/\[CAUTION\](\n[.]([^\n]+))?(\n(={4})\n)(.+?)(\3)/gms, 
            (_, __, legend, ___, ____, content) => admonition('☢|', 'red.bold', legend, 'red.underline', content, ''))
    .replace(/\[IMPORTANT\](\n[.]([^\n]+))?(\n(={4})\n)(.+?)(\3)/gms,
            (_, __, legend, ___, ____, content) => admonition('❗|', 'redBright.bold', legend, 'redBright.underline', content, ''))
    .replace(/\[WARNING\](\n[.]([^\n]+))?(\n(={4})\n)(.+?)(\3)/gms,
            (_, __, legend, ___, ____, content) => admonition('/!\\\\|', 'yellow.bold', legend, 'yellow.underline', content, ''))
    .replace(/\[NOTE\](\n[.]([^\n]+))?(\n(={4})\n)(.+?)(\3)/gms,
            (_, __, legend, ___, ____, content) => admonition('ℹ|', 'blue.bold', legend, 'blue.underline', content, ''))
    .replace(/\[TIP\](\n[.]([^\n]+))?(\n(={4})\n)(.+?)(\3)/gms,
            (_, __, legend, ___, ____, content) => admonition('⛭|', 'yellow.bold', legend, 'yellow.underline', content, ''));
  // handle tabs
  parsed = parseTabContainer(parsed);
  return parsed;
};

const highlight = (language, legend, code) => {
  // TODO: handle syntax highlighting like vim ?
  return `{whiteBright.bgBlackBright ${fillLines(code)}\n}`;
};

const admonition = (icon, iconStyle, legend, legendStyle, text, textStyle) => {
  const decoratedLines = [];
  const lines = fillLines(text).split('\n');
  let middle = Math.floor(lines.length / 2);
  if (legend) {
    let legendStr = legendStyle
      ? '{' + legendStyle + ' ' + legend + '}'
      : legend;
    decoratedLines.push(addIcon(icon, iconStyle) + ' ' + legendStr);
    middle -= 1;
  }
  let i = 0;
  for (let line of lines) {
    let iconStr = addIcon(icon, iconStyle, i, middle);
    let textStr = textStyle ? '{' + textStyle + ' ' + line + '}' : line;
    decoratedLines.push(iconStr + ' ' + textStr);
    i++;
  }
  return decoratedLines.join('\n') + '\n';
};

const addIcon = (icon, iconStyle, lineNumber = 0, middle = 1) => {
  let iconStr =
    lineNumber == middle
      ? icon
      : icon.replace(/\\\\/g, ' ').replace(/[^|]/g, ' ');
  return iconStyle ? '{' + iconStyle + ' ' + iconStr + '}' : iconStr;
};

const fillLines = (content, fillChar = ' ', extraSpaces = 2) => {
  let width = 0;
  const lines = content.split('\n');
  for (let line of lines) {
    if (line.length > width) {
      width = line.length;
    }
  }
  const filledLines = [];
  for (let line of lines) {
    filledLines.push(line.padEnd(width + extraSpaces, fillChar));
  }
  return filledLines.join('\n');
};

const parseTabContainer = (content) => {
  return content.replace(
    /^\[role="?tab-container"?\]\n.+?\n(.+)\[role="?tab-container-end"?\]\s-/gms,
    function(_, tabContainerContent) {
      return parseTabs(tabContainerContent);
    },
  );
};

const parseTabs = (content) => {
  let parsed = content;
  let i = 0; // just in case
  while (parsed.match(/\[role="?tab"?/) && i++ < 5) {
    parsed = parsed.replace(
      /\[role="?tab"?(, ?condition="?([^(]+)\(([^)]*)\)"?)\]\s(.+?)\n(.+(\[role="?tab)?)/gms,
      function(_, __, condition, parameters, tabName, tabContent) {
        trace('found tab', tabName, `${condition}(${parameters})`);
        // TODO: handle parameters?
        if (conditions[condition]()) {
          return tabContent;
        } else {
          return '';
        }
      },
    );
  }
  return parsed;
};

module.exports = { parse };
