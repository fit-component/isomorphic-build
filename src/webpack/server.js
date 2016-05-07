// @babel ignore
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')
var path = require('path')

new WebpackDevServer(webpack(config), {
    contentBase       : path.join(process.cwd(), 'client'),
    publicPath        : config.output.publicPath,
    hot               : true,
    historyApiFallback: true,
    promiseMiddleware : true
}).listen(8090, 'localhost', function (err, result) {
    if (err) {
        console.log(err)
    }

    console.log('Listening at localhost:8090')
})