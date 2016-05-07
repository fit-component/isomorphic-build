// @babel ignore
const removeCss = require('../utils/remove-css')

module.exports = function (config, patterns) {
    return function (options, modified, total, next) {
        var list = []
        total.forEach(function (file) {
            if (
                !/^\/client/.test(file.subpath)
                || /^\/client\/static/.test(file.subpath)
                || /^\/client\/pkg/.test(file.subpath)
                || !file.isText()
            ) {
                return
            }

            var f = fis.file(file.fullname)

            if (f.ext === '.html') {
                // html 按照原来内容处理
                var content = file.getContent()
                f.setContent(content.trim())
            } else {
                f.useHash = false
                f.isMod = false
                f.standard = false
                f.optimizer = false
                f.useCache = false

                fis.compile(f)
            }

            // 如果是类js文件,后缀换成js,让node读到,否则tsx无法读取
            if (f.rExt === '.js') {
                f.release = '/app/' + config.modName + file.subpathNoExt + '.js'
            } else {
                f.release = '/app/' + config.modName + file.subpath
            }

            removeCss(f)

            list.push(f)
        })

        modified.push.apply(modified, list)
        total.push.apply(total, list)
        next()
    }
}