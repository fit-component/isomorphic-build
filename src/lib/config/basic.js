// @babel ignore
const path = require('path')

module.exports = function (media, config, build, fis) {
    // 全部设置成是模块化
    media.match('/{node_modules,/client}/**.{js,tsx}', {
        isMod: true
    })

    // 入口文件非模块化
    media.match('/client/index.tsx', {
        isMod: false
    })

    // static 文件夹文件 不处理且 非模块化
    media.match('/client/static/**', {
        parser: null,
        isMod : false
    })

    // 处理 js 中 css 等引用
    media.match('*.{js,jsx,es,ts,tsx}', {
        preprocessor: [
            fis.plugin('js-require-css'),
            fis.plugin('js-require-file', {
                useEmbedWhenSizeLessThan: 10 * 1024
            })
        ]
    })

    media.match('/client/(**).{tsx:html,scss}', {
        wrapClassName: '$1'
    })

    // 修改发布路径
    media.match('{/client/(**)}', {
        release: '/static/${build.modName}/$1'
    })
    media.match('/client/index.html', {
        rExt   : '.tpl',
        release: '/views/${build.modName}/index.tpl'
    })

    /**
     * css: node-sass 解析
     */
    media.match('*.scss', {
        rExt         : 'css',
        parser       : [
            fis.plugin(build.parser.wrapComponent),

            fis.plugin('node-sass', {
                include_paths: []
            })
        ],
        postprocessor: fis.plugin('autoprefixer-6.x')
    })

    // 用 loader 来自动引入资源
    media.match('::package', {
        postpackager: fis.plugin('loader')
    })
}