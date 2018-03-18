"use strict";

const AWS =  require('aws-sdk');
const accessKeyId = require("./env.js");
const secretAccessKey = require("./env.js");

const options = {
  hosts: ["https://search-crux-staging-4xqx45vugm4qywnwcq7draso2m.us-east-1.es.amazonaws.com"],
  connectionClass: require("http-aws-es"),
  awsConfig: new AWS.Config({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: "us-east-1"
  }),
  httpOptions: {}
};

const client = require("elasticsearch").Client(options);

client.deleteByQuery({
  query: { 
    match_all: {}
  },
  index: "origin-index",
  type: "all"
}, function(res, err) {
  if(res) {
    console.log(res);
  } else {
    console.log(err);
  }
});
