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
  });

  const results = await textractPromise;
  return generateKeyValueObject(results);
};

function generateKeyValueObject (textractResults) {
  const blocks = textractResults.Blocks;

  const blocksById = {};
  blocks.forEach(block => {
    blocksById[block.Id] = block;
  });

  const keyValueBlocks = blocks.filter(block => block.BlockType === "KEY_VALUE_SET");

  const keyBlocks = keyValueBlocks.filter(block => block.EntityTypes[0] === "KEY");

  let returnArray = [];

  keyBlocks.forEach(keyBlock => {
    var key = '';
    var keyBlockChildrenIds = keyBlock.Relationships.filter(rel => rel.Type === "CHILD")[0]["Ids"];
    keyBlockChildrenIds.forEach(id => {
      var block = blocks.filter(block => block.Id === id)[0];
      if (block.BlockType === "WORD") {
        if (key) {
          key = `${key} ${block.Text}`;
        } else {
          key = key + block.Text;
        }
      }
    });

    var valueValue = '';
    // var valueBlock = blocksById[keyBlock.Relationships.filter(rel => rel.Type === "VALUE")[0]["Ids"][0]]

    // var keyBlockValueIds = keyBlock.Relationships.filter(rel => rel.Type === "VALUE")[0]["Ids"];
    // keyBlockValueIds.forEach(id => {
    //   var valueBlock = blocks.filter(block => block.Id === id)[0];
    //   if (valueBlock.EntityTypes[0] === "VALUE") {
    //     var childrenIds = valueBlock.Relationships.filter(rel => rel.type === "CHILD")[0]["Ids"];
    //     childrenIds.forEach(id => {
    //       var wordBlock = blocks.filter(block => block.Id === id)[0];
    //       if (wordBlock.BlockType === "WORD") {
    //         if (valueValue) {
    //           valueValue = `${valueValue} ${wordBlock.Text}`;
    //         } else {
    //           valueValue = valueValue + wordBlock.Text;
    //         }
    //       }
    //     });
    //   }
    // });

    returnArray.push({
      key: key,
      value: valueValue
    });
  });

  return returnArray;
}
