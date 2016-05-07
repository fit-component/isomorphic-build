// @babel ignore
function normalize(className) {
  return className.replace(/[^a-z\d\-_]+/g, '-');
}

function removeComments(css) {
  return css.replace(/\/\*(\r|\n|.)*\*\//g, "")
}

function removeSpace(css) {
  return css.replace(/\s+/g, '')
}


function parseCss(css) {
  var rules = {}
  var index = css.indexOf('._global')
  var globalIndex
  var globalEnd
  var needClose = false

  if (index === -1) return

  for (var i in css) {
    if (i < index) continue

    if (globalIndex && globalEnd) break

    var pol = css[i]

    if (pol === '{' && !globalIndex) {
      globalIndex = parseInt(i, 10) + 1
    }
    else if (pol === '}' && !needClose && !globalEnd) {
      globalEnd = parseInt(i, 10)
    }
    else if (pol === '{' && globalIndex && !needClose) {
      needClose = true
    }
    else if (pol === '}' && needClose) {
      needClose = false
    }
  }

  if (!globalIndex || !globalEnd) {
    return null
  }
  else {
    return {
      content: css.substring(globalIndex, globalEnd),
      _index : index,
      index  : globalIndex,
      end    : globalEnd
    }
  }
}

module.exports = function (content, file) {
  var pathArray = file.subdirname.split('/')
  pathArray = pathArray.map(function (item) {
    return item.replace(/-/, '_')
  })
  pathArray = pathArray.filter(function (item) {
    return item !== ''
  })
  var className = normalize(pathArray.join('-'))

  if (/\.jsx|\.tsx/.test(file.basename) && /_namespace/i.test(content)) {
    content = content.replace(/_namespace/ig, className)
  } else if (file.ext === '.scss') {
    var global = parseCss(content)
    var hasGlobal = !!global

    if (hasGlobal) {
      content = global.content + '\n .' + className + '{' + content.substring(0, global._index) + content.substring(global.end + 1) + '}'
    } else {
      content = '.' + className + '{' + content + '}'
    }
  }

  return content
}
