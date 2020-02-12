exports.handler = async (event) => {
  // TODO implement
  const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda! On my computer and now I have changed it!'),
  };
  return response;
};