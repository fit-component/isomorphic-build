// @babel ignore
const path = require('path')

module.exports = function (config, build, fis) {
    fis.set('system.localNPMFolder', path.join(__dirname, 'node_modules'))
    if (fis.require.paths && fis.require.paths.length) {
        fis.require.paths.splice(1, 0, path.join(__dirname, 'node_modules'))
    }
    fis.set('build', config)
    fis.set('namespace', config.modName)

    // 处理的文件
    fis.set('project.files', [
        // client 按需加载
        '/client/index.html',
        // server 全部加载
        '/server/**'
    ])

    // 采用 commonjs 规范作为模块化标准
    fis.hook('commonjs', {
        baseUrl: './client',
        extList: ['.js', '.es', '.ts', '.tsx', '.jsx']
    })

    // 使用 fis3-hook-node_modules 插件处理 npm 生态组件
    fis.unhook('components')
    fis.hook('node_modules', {
        ignoreDevDependencies: true
    })

    fis.match('/client/**.{jsx,tsx}', {
        rExt  : 'js',
        parser: [
            // typescript 解析
            fis.plugin('typescript', {
                module: 1,
                target: 0
            }),
            // html namespace 处理
            fis.plugin(build.parser.wrapComponent)
        ]
    })

    // 修改发布路径
    fis.match('*.tar', {
        release: 'all.tar'
    })

    fis.match('*.{swf,png,gif,jpg,jpeg,svg,ttf,eot,woff,woff2,flv,f4v,cur}', {
        release: '/static/${build.modName}/$0'
    })

    /**
     * client: 额外处理
     */
    fis.match('/client/(**)', {
        postprocessor: function (content, file, settings) {
            const contentArray = content.split('\n')

            // 将 server 去除
            contentArray.forEach(function (line, index) {
                if (line.indexOf('../server/') > -1) {
                    contentArray[index] = line.replace(/\.\.\/server\//g, '..\/')
                }
            })

            return contentArray.join('\n')
        }
    })

    /**
     * server: 额外处理
     */
    fis.match('/server/(**)', {
        postprocessor: function (content, file, settings) {
            const contentArray = content.split('\n')

            // 将引入 client 换成上级目录
            contentArray.forEach(function (line, index) {
                if (line.indexOf('../client/') > -1) {
                    contentArray[index] = line.replace(/\.\.\/client\//g, '.\/client\/')
                }
            })

            return contentArray.join('\n')
        }
    })

    fis.match('/node_modules/**', {
        useCompile: true
    })
}