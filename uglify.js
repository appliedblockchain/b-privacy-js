const UglifyJS = require('uglify-es')
const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')

function minifyDirectory(minifyPath, buildDirectory, buildSrc) {
  fs.readdir(path.join(minifyPath), (err, files) => {
    if (err) {
      console.log(`Error: ${err}`)
    }

    files.forEach(file => {
      const filePath = path.join(minifyPath, file)
      const stat = fs.statSync(filePath)
      const isDirectory = stat.isDirectory()
      if (isDirectory) {
        const writePath = minifyPath.replace(buildSrc, buildDirectory) + '/' + file
        fs.mkdirSync(writePath)
        minifyDirectory(minifyPath + '/' + file, buildDirectory, buildSrc)
        return
      }

      const code = fs.readFileSync(filePath, 'utf8')
      const { code: minified } = UglifyJS.minify(code)
      const writePath = minifyPath.replace(buildSrc, buildDirectory) + '/' + file
      fs.writeFileSync(writePath, minified, { encoding: 'utf8' })
    })
  })
}

rimraf('./dist', (err) => {
  if (err) {
    return
  }

  const rootPath = path.join(__dirname, './src')
  const buildPath = path.join(__dirname, './dist')
  fs.mkdirSync(buildPath)
  fs.mkdirSync(buildPath + '/src')
  fs.mkdirSync(buildPath + '/test')
  minifyDirectory(rootPath, '/dist/src', '/src')
  minifyDirectory(path.join(__dirname, './test'), '/dist/test', '/test')
})
