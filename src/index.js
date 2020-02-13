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

  const results = await textractPromise
  return generateKeyValueObject(results)
};

function generateKeyValueObject (textractResults) {
  const blocks = textractResults.Blocks;

  const blocksById = {};
  blocks.forEach(block => {
    blocksById[block.Id] = block
  });

  const keyValueBlocks = blocks.filter(block => block.BlockType === "KEY_VALUE_SET")
  return keyValueBlocks
}
