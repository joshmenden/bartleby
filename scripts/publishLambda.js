require('dotenv').config()
import shell from 'shelljs'
shell.cd('src')
shell.exec('zip ../index.zip *')
shell.cd('..')
let commandString = `aws lambda create-function --function-name ${process.env.FUNCTION_NAME} --runtime nodejs12.x --role ${process.env.ROLE_ARN} --handler "index.handler" --zip-file "fileb://index.zip"`
shell.exec(commandString)