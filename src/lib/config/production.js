// @babel ignore
module.exports = function (media, config, build, fis) {
    // 压缩 css
    media.match('*.{css,scss}', {
        optimizer: fis.plugin('clean-css')
    })

    // png 压缩
    media.match('*.png', {
        optimizer: fis.plugin('png-compressor')
    })

    // 压缩 js 文件
    media.match('*.{js,tsx}', {
        optimizer: fis.plugin('uglify-js')
    })
    
    // 依赖打包
    config.pack && media.match('::package', {
        packager: fis.plugin('deps-pack', config.pack)
    })
}