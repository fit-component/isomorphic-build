// @babel ignore
module.exports = function () {
    var ip = false
    var net = require('os').networkInterfaces()

    Object.keys(net).every(function (key) {
        var detail = net[key]
        Object.keys(detail).every(function (i) {
            var address = String(detail[i].address).trim()
            if (address && /^\d+(?:\.\d+){3}$/.test(address) && address !== '127.0.0.1') {
                ip = address
            }
            return !ip // 找到了，则跳出循环
        })
        return !ip // 找到了，则跳出循环
    })
    return ip || '127.0.0.1'
}