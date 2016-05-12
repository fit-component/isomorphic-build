// @babel ignore
const path = require('path')
const commonConfig = require('./lib/config/common')
const basicConfig = require('./lib/config/basic')
const productionConfig = require('./lib/config/production')
const assign = require('object-assign')

const build = module.exports = function (fis, config) {
    config = assign({
        // 模块名
        modName: 'react',

        // 打包相关，只有 fis 和 production 模式有效
        pack: {
            '/client/pkg/bundle.js': [
                '/client/index.tsx',
                '/client/index.tsx:deps'
            ],

            '/client/pkg/bundle.css': [
                '*.scss',
                '*.css'
            ]
        },

        // 默认开发机地址
        host: 'http://127.0.0.1:8080',

        receiverStaticPort: 8080,

        // 可选： gbk 、utf8
        charset: 'utf8'
    }, config)

    config.modName = config.modName || 'react'

    //  ----------------------------------------
    //  公共配置
    //  ----------------------------------------
    commonConfig(config, build, fis)

    //  ----------------------------------------
    //  dev
    //  本地开发时使用
    //  ----------------------------------------
    const dev = fis.media('dev')

    var tarFlag = false
    var yogTarFlag = false

    dev.match('*', {
        optimizer: null,
        useHash  : false,
        deploy   : [
            build.deploy.copyClient(config),
            build.deploy.copyNodeModules(config),

            function (options, modified, total, next) {
                modified.filter(function (file) {
                    return file.subpath === '/client/index.html'
                }).forEach(function (file) {
                    var content = file.getContent()
                    content = content.replace(/\/static\/[\w-]+\/index\.js/g, 'http://127.0.0.1:8090/index.tsx')
                    file.setContent(content)
                })
                next()
            },

            // 打成一个包发送过去
            function (options, modified, total, next) {
                if (!tarFlag) {
                    tarFlag = true
                    return fis.require('deploy-tar')({
                        filename: 'all.tar'
                    }, modified, total, next)
                }
                next()
            },

            function (options, modified, total, next) {
                var uploadUrl = yogTarFlag ? '/yog/upload' : '/yog/uploadtar'
                if (!yogTarFlag) {
                    yogTarFlag = true
                }
                return fis.require('deploy-http-push')({
                    receiver: 'http://127.0.0.1:' + config.receiverStaticPort + uploadUrl,
                    to      : '/'
                }, modified, total, next)
            }
        ]
    })

    //  ----------------------------------------
    //  preview
    //  预上线时使用。
    //  ----------------------------------------
    const preview = fis.media('preview')
    basicConfig(preview, config, build, fis)
    productionConfig(preview, config, build, fis)

    preview.match('*', {
        charset: config.charset,
        deploy : [
            build.deploy.copyClient(config),
            build.deploy.copyNodeModules(config),

            fis.plugin('skip-packed'),
            fis.plugin('encoding'),

            // 打成一个包发送过去
            function (options, modified, total, next) {
                return fis.require('deploy-tar')({
                    filename: 'all.tar'
                }, modified, total, next)
            },

            fis.plugin('http-push', {
                receiver: 'http://127.0.0.1:' + config.receiverStaticPort + '/yog/uploadtar',
                to      : '/'
            })
        ]
    })

    //  ----------------------------------------
    //  remote
    //  预上线时使用。
    //  ----------------------------------------
    const remote = fis.media('remote')
    basicConfig(remote, config, build, fis)
    productionConfig(remote, config, build, fis)

    remote.match('*', {
        charset: config.charset,
        deploy : [
            build.deploy.copyClient(config),
            build.deploy.copyNodeModules(config),

            fis.plugin('skip-packed'),
            fis.plugin('encoding'),

            fis.plugin('http-push', {
                receiver: config.host + '/yog/upload',
                to      : '/'
            })
        ]
    })

    //  ----------------------------------------
    //  production
    //  上线时使用
    //  ----------------------------------------
    const production = fis.media('production')
    basicConfig(production, config, build, fis)
    productionConfig(production, config, build, fis)
    
    production.match('*.tar.gz', {
        release: '$0'
    })

    production.match('*', {
        charset: config.charset,
        deploy : [
            build.deploy.copyClient(config),
            build.deploy.copyNodeModules(config),

            fis.plugin('skip-packed'),
            fis.plugin('encoding'),

            // 清空列表
            function (_, modified, total, next) {
                modified.splice(0, modified.length)
                next()
            },

            build.deploy.tar(config.modName + '.tar.gz', ['/app/**', '/views/**']),
            build.deploy.tar('static-' + config.modName + '.tar.gz', '/static/**'),

            fis.plugin('local-deliver', {
                to: './output'
            })
        ]
    })
}

build.parser = require('./lib/parser')
build.deploy = require('./lib/deploy')