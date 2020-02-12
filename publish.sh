cd src
zip ../index.zip *
cd ..
aws lambda update-function-code --function-name hello_node --zip-file fileb://index.zip
rm index.zip