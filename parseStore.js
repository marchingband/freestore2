const fs = require('fs')

const templates = fs.readdirSync('./templates')
for(var i = 0; i<templates.length; i++){
  var fileName = templates[i]
  var fileStream = fs.readFileSync(`./templates/${fileName}`)
  var file = String(fileStream)
  if(String(file)[0]=='*'){
    const fileNameWithoutExtension = fileName.split('.')[0]
    const parser = require(`./parsers/${fileNameWithoutExtension}.js`)
    const output = parser.parser(file)
    console.log(output)
    fs.writeFileSync('./src/store.js',output)
  }
}

const password = process.env.PUBLIC_KEY
const passwordfile = `const PUBLIC_KEY =  \`` + password + `\`` + "\nmodule.exports={PUBLIC_KEY}"
fs.writeFileSync('./src/PUBLIC_KEY.js',passwordfile)