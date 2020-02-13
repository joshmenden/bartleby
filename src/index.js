var AWS = require('aws-sdk');

exports.handler = async (event) => {
  var params = textractParams(event)

  var textract = new AWS.Textract();

  const textractPromise = new Promise(function (resolve, reject) {
    textract.analyzeDocument(params, function(err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });

  const results = await textractPromise;
  var parsed = parse(results);
  if (event.condense) {
    return condense(parsed);
  } else {
    return parsed;
  }
};

function textractParams (event) {
  return {
    Document: {
      S3Object: {
        Bucket: event.Bucket,
        Name: event.Name,
      }
    },
    FeatureTypes: ["FORMS"]
  };
}

function parse (textractResults) {
  const blocks = textractResults.Blocks;

  const blocksById = {};
  blocks.forEach(block => {
    blocksById[block.Id] = block;
  });

  const keyValueBlocks = blocks.filter(block => block.BlockType === "KEY_VALUE_SET");
  const keyBlocks = keyValueBlocks.filter(block => block.EntityTypes[0] === "KEY");

  let returnArray = [];

  keyBlocks.forEach(keyBlock => {
    returnArray.push(extractValuesFromKeyValueSet(blocksById, keyBlock))
  });

  return returnArray;
}

function extractValuesFromKeyValueSet (mappedBlocks, keyBlock) {
  var keyBlockChildrenIds = keyBlock.Relationships.filter(rel => rel.Type === "CHILD")[0]["Ids"];
  var key = collectValueObjectsFromIds(mappedBlocks, keyBlockChildrenIds);

  var associatedValueBlockId = keyBlock.Relationships.filter(rel => rel.Type === "VALUE")[0]["Ids"][0];
  var associatedValueBlock = mappedBlocks[associatedValueBlockId];
  var relationships = associatedValueBlock.Relationships;
  var value = null
  if (relationships) {
    var valueBlockChildrenIds = relationships.filter(rel => rel.Type === "CHILD")[0]["Ids"];
    value = collectValueObjectsFromIds(mappedBlocks, valueBlockChildrenIds);
  }

  return {
    key: key,
    value: value
  };
}

function condense (parsed) {
  return parsed.map(keyValue => {
    return {
      key: keyValue.key.map(keyWords => keyWords.text).join(" "),
      value: keyValue.value ? keyValue.value.map(valueWords => valueWords.text).join(" ") : null
    }
  })
}

function collectValueObjectsFromIds (mappedBlocks, ids) {
  var collection = [];

  ids.forEach(id => {
    var block = mappedBlocks[id];
    if (block.BlockType === "WORD") {
      collection.push({
        text: block.Text,
        confidence: block.Confidence
      });
    }
  });

  return collection;
}
