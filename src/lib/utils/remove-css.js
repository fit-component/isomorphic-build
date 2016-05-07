// @babel ignore
module.exports = function (file) {
    if (file.ext === '.js' || file.ext === '.jsx' || file.ext === '.tsx') {
        var fileContent = file.getContent()
        fileContent = fileContent.replace(/require\(\'[a-zA-Z\-_\/\.]*css'\);/g, '')
        fileContent = fileContent.replace(/require\(\'[a-zA-Z\-_\/\.]*scss'\);/g, '')
        file.setContent(fileContent)
    }
}