var AWS = require('aws-sdk');

exports.handler = async (event) => {
  var params = {
    Document: {
      S3Object: {
        Bucket: event.Bucket,
        Name: event.Name,
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
    var keyBlockChildrenIds = keyBlock.Relationships.filter(rel => rel.Type === "CHILD")[0]["Ids"];
    var key = collectValuesFromIds(blocksById, keyBlockChildrenIds);

    var associatedValueBlockId = keyBlock.Relationships.filter(rel => rel.Type === "VALUE")[0]["Ids"][0];
    var associatedValueBlock = blocksById[associatedValueBlockId];
    var relationships = associatedValueBlock.Relationships;
    var value = ''
    if (relationships) {
      var valueBlockChildrenIds = relationships.filter(rel => rel.Type === "CHILD")[0]["Ids"];
      value = collectValuesFromIds(blocksById, valueBlockChildrenIds);
    }

    returnArray.push({
      key: key,
      value: value
    });
  });

  return returnArray;
}

function collectValuesFromIds (mappedBlocks, ids) {
  var collectedString = '';
  ids.forEach(id => {
    var block = mappedBlocks[id];
    if (block.BlockType === "WORD") {
      if (collectedString) {
        collectedString = `${collectedString} ${block.Text}`;
      } else {
        collectedString = collectedString + block.Text;
      }
    }
  });

  return collectedString;
}
