const conditions = require('./conditions');
const { trace, log, error, info, help } = require('../utils/log');


const parse = (content) => {
  let parsed = content
      // remove asciidoctor variables
      .replace(/:relative-path:.*/g, "")
      .replace(/include::\{docdir\}\/variables.adoc\[\]\s*/g, "")
      // remove single line comment (these lines must be displayed in terminal)
      .replace(/^\/\/ /gm, "")
      // handle new line syntax
      .replace(/ \+$/gm, "")
      // handle titles
      .replace(/^== (.+)$/gm, "{bold.underline $1}")
      .replace(/^=== (.+)$/gm, "{bold $1}")
      // handle code
      .replace(/```([^`]+)```/g, "{whiteBright.bgBlackBright $1}")
      .replace(/`([^`]+)`/g, "{whiteBright.bgBlackBright $1}")
  // handle tabs
  parsed = parseTabContainer(parsed)
  return parsed
}

const parseTabContainer = (content) => {
  return content.replace(/^\[role="?tab-container"?\]\n.+?\n(.+)\[role="?tab-container-end"?\]\s-/gms, function(_, tabContainerContent) {
    return parseTabs(tabContainerContent)
  })
}

const parseTabs = (content) => {
  let parsed = content
  let i = 0     // just in case
  while(parsed.match(/\[role="?tab"?/) && i++ < 5) {
    parsed = parsed.replace(/\[role="?tab"?(, ?condition="?([^(]+)\(([^)]*)\)"?)\]\s(.+?)\n(.+(\[role="?tab)?)/gms, function(_, __, condition, parameters, tabName, tabContent) {
      trace("found tab", tabName, `${condition}(${parameters})`)
      // TODO: handle parameters?
      if(conditions[condition]()) {
        return tabContent
      } else {
        return ""
      }
    })
  }
  return parsed
}

module.exports = { parse }