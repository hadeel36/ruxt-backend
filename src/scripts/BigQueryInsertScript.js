"use strict";

const AWS =  require('aws-sdk');
const BigQuery = require("@google-cloud/bigquery");
const BigQueryProjectId = require("./env.ts");
const googleApplicationCredentials = require("./env.ts");
const accessKeyId = require("./env.ts");
const secretAccessKey = require("./env.ts");

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

const items = [];

if(env.BigQueryProjectId) {
  const projectId = env.BigQueryProjectId;
}  else {
  console.log("Please set project id");
}

if(env.googleApplicationCredentials) {
  const bigQuery =  new BigQuery({
    projectId: projectId,
    credentials: require(env.googleApplicationCredentials),
  });
} else {
  console.log("please add credentials json file path");
}

const dataSetName = "chrome-ux-report.all.201711";

const sqlQuery = `
  SELECT
    DISTINCT origin
  FROM
    \`chrome-ux-report.all.201711\`
`;

const queryOption = {
  query: sqlQuery,
  useLegacySql: false,
};

function printResult(rows) {
  rows.forEach(row => {
    let origin = row["origin"];
    items.push({index: {_index: "origin-index", _type: "all", _id: origin}}, {origin});
  });
  for(let i=0; i<2000;  i=i+50) {
    client.bulk({
      body: items.slice(i, i+50)
    }, function(err, res) {
      if(err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
  }
}

bigQuery.query(queryOption).then(results => {
  const rows = results[0];
  printResult(rows);
}).catch(err => {
  console.log(err);
});
