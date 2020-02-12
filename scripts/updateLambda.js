require('dotenv').config()
var shell = require('shelljs')


shell.cd('src')
shell.exec('zip ../index.zip *')
shell.cd('..')
let commandString = `aws lambda update-function-code --function-name ${process.env.FUNCTION_NAME} --zip-file "fileb://index.zip"`
shell.exec(commandString)
shell.rm('index.zip')