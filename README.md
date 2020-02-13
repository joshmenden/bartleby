# bartleby

A simple repo that extracts Key-Value pairs from an image using [AWS Textract](https://console.aws.amazon.com/textract/home?region=us-east-1#/) for people who would ["prefer not to."](http://www.gutenberg.org/cache/epub/11231/pg11231.html)

## Setup

Really this repo is just an [AWS Lambda](https://aws.amazon.com/lambda/) function that takes an S3 object, parses the response, and spits out all the Key-Value pairs that AWS Textract can find.