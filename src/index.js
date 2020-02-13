var AWS = require('aws-sdk');

exports.handler = async (event) => {
  var params = {
    Document: {
      S3Object: {
        Bucket: 'bartleby',
        Name: 'fake-w2-forms.jpg',
      }
    },
    FeatureTypes: ["FORMS"]
  };

  var textract = new AWS.Textract();

  const textractPromise = new Promise(function (resolve, reject) {
    textract.analyzeDocument(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })

  return textractPromise
  // textractPromise.then(res => {
  //   const response = {
  //     statusCode: 200,
  //     textract: JSON.stringify(res),
  //     body: JSON.stringify('Hello THIS IS US from my NPM script'),
  //   };

  //   return response;
  // })
};
