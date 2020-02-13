# bartleby

A simple [AWS Lambda](https://aws.amazon.com/lambda/) function that extracts Key-Value pairs from an image using [AWS Textract](https://console.aws.amazon.com/textract/home?region=us-east-1#/) for people who would ["prefer not to."](http://www.gutenberg.org/cache/epub/11231/pg11231.html)

## Setup

This Lambda function takes in an S3 reference and spits back out all of the Key Value pairs that AWS Textract can find.

None of this works without an AWS CLI installed and configured. Follow [these instructions](https://docs.aws.amazon.com/polly/latest/dg/setup-aws-cli.html) to set that up.

To start, run

```
npm install // install dependencies, for publish and update helpers
touch .env // create a file for environment variables
```

In your `.env` file, you need 2 keys: `FUNCTION_NAME` and `ROLE_ARN`. `FUNCTION_NAME` is what you'd like to name your deployment of this Lambda function. The `ROLE_ARN` is the AWS role that you want your deployment of this Lambda function to assume. In order for this to work, your role needs both S3 and Textract access.

So, an example `.env` file:

```
FUNCTION_NAME=bartlebyExtract
ROLE_ARN=arn:aws:iam::99999999999:role/foo_bar_baz
```

With all of this in place, you're ready to deploy your Lambda function!

## Deployment

There are 2 basic scripts to help with development:

`npm run publish_lambda` will publish the function, and,
`npm run update_lambda`, to update the function if you make any changes to the code.

## Usage

The Lambda event requires 2 arguments, and accepts 3.

```
{
  "Bucket": "bartleby", // bucket name, required
  "Name": "fake-w2-forms.jpg", // s3 object name, required
  "condense": false // explained below, optional
}
```

If condense is true, you can expect a return object that looks like this

```
[
  {
    "key": "Name:",
    "value": "Bartleby"
  },
  {
    "key": "Occupation",
    "value": "the Scrivener"
  },
  ...
]
```

Otherwise, if condense is false or not included, each word of both the key and value are separated into their own object and include AWS's confidence score in those individual words.

```
[
  {
    "key": [
      {
        "text": "Name:",
        "confidence": 99.93144989013672
      }
    ],
    "value": [
      {
        "text": "Bartleby",
        "confidence": 97.45654345654
      }
    ]
  },
  {
    "key": [
      {
        "text": "Occupation:",
        "confidence": 96.93144989013672
      }
    ],
    "value": [
      {
        "text": "the",
        "confidence": 99.9874289879
      },
      {
        "text": "Scrivener",
        "confidence": 99.8758549483
      }
    ]
  }
]
```

## Eventually...

Would love to include a "Tables" event param that could also return table data in CSV form if possible.