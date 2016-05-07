// @babel ignore
var archiver = require('archiver');
var _ = require('lodash');
var concatStream = require('concat-stream');
var path = require('path');

function filter(arr, globs) {
    var find = function (reg) {
        return arr.filter(function (file) {
            return reg.test(file.release);
        });
    }

    return globs.reduce(function (ret, item) {
        return _[item.negate ? 'difference' : 'union'](ret, find(item.reg));
    }, []);
}

module.exports = function (filename, globs, prefix) {
    globs = globs || '*';

    if (!Array.isArray(globs)) {
        globs = [globs];
    }

    globs = globs.map(function (raw) {
        var negate = false;
        var reg = raw;

        if (typeof raw === 'string') {
            if (raw[0] === '!') {
                negate = true;
                reg = raw.substring(1);
            }

            reg = fis.util.glob(reg);
        }

        return {
            raw: raw,
            reg: reg,
            negate: negate
        }
    });

    var root = fis.project.getProjectPath();

    return function (_, modified, total, next) {
        var files = filter(total, globs);
        if (!files.length) {
            return next();
        }

        var tarfile = archiver('tar', {
            gzip: /\.tar\.gz$/i.test(filename)
        });

        files.forEach(function (file) {
            if (file.release !== false) {
                var filepath = file.getHashRelease().substring(1);
                tarfile.append(file.getContent(), {
                    name: prefix ? path.join(prefix, filepath) : filepath,
                    mode: null
                });
            }
        });

        tarfile.finalize();

        tarfile.pipe(concatStream(function (data) {
            var file = fis.file(root, filename);
            file.setContent(data);
            modified.push(file);
            total.push(file);
            next();
        }))

    };
};
