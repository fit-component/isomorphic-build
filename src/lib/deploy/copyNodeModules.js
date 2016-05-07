// @babel ignore
const assign = require('object-assign')
const path = require('path')
const removeCss = require('../utils/remove-css')

var flag = false
var caches = []

module.exports = function (config) {
    return function (options, modified, total, next) {
        var list = []
        var patterns = []
        var source = {}

        if (flag) {
            return next()
        }

        flag = true
        console.log('\nCopy node_modules ...')

        // 全部复制, 排除 devDependencies
        var pkg = fis.util.readJSON(path.join(fis.project.getProjectPath(), 'package.json'))
        var ignore = []
        pkg.devDependencies && Object.keys(pkg.devDependencies).forEach(function(name) {
            ignore.push(name + '/**')
        })
        assign(source, fis.project.getSourceByPatterns('**', {
            cwd: path.join(fis.project.getProjectPath(), 'node_modules'),
            ignore: ignore
        }))

        Object.keys(source).forEach(function (key) {
            var file = source[key]

            file.useHash = false
            file.release = '/app/' + config.modName + file.subpath
            removeCss(file)

            list.push(file)
        })

        modified.push.apply(modified, list)
        total.push.apply(total, list)
        next()
    }
}
