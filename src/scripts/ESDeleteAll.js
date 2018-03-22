const AWS = require('aws-sdk');
const env = require("./env.js");
const { ESHost } = env;

const options = {
  hosts: [ESHost],
  connectionClass: require('http-aws-es'),
  awsConfig: new AWS.Config({ region: 'us-east-1' })
};
const client = require('elasticsearch').Client(options);

client.deleteByQuery({
  index: 'origin-index',
  body: {
    query: {
        match_all: {  }
    }
  },
  conflicts: "proceed"
}, function (error, response) {
  // ...
  console.log(error);
  console.log(response);
});