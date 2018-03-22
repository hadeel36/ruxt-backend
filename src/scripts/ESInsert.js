"use strict";

const AWS =  require('aws-sdk');
const BigQuery = require("@google-cloud/bigquery");
<<<<<<< HEAD:src/scripts/BigQueryInsertScript.js
const BigQueryProjectId = require("./env.js");
const googleApplicationCredentials = require("./env.js");
const accessKeyId = require("./env.js");
const secretAccessKey = require("./env.js");
=======
const env = require("./env.js");

const projectId = env.BigQueryProjectId;
const { googleApplicationCredentials, dataSetName, ESHost } = env;
>>>>>>> 217968d1d95bf5df10047fa6275afd9f8ed084b1:src/scripts/ESInsert.js

const options = {
  hosts: [ESHost],
  connectionClass: require("http-aws-es"),
  awsConfig: new AWS.Config({ region: 'us-east-1' })
  httpOptions: {}
};

const client = require("elasticsearch").Client(options);

const items = [];

if(!projectId) {
  console.log("Please set project id");
  process.exit();
}

if(!googleApplicationCredentials) {
  console.log("please add credentials json file path");
  process.exit();
}

const bigQuery =  new BigQuery({
  projectId,
  credentials: require(googleApplicationCredentials),
});

const sqlQuery = `
  SELECT
    DISTINCT origin
  FROM
    \`${dataSetName}\`
`;

const queryOption = {
  query: sqlQuery,
  useLegacySql: false,
};

function printResult(rows) {
  console.log(`received ${rows.length} rows`);
  rows.forEach(row => {
    let origin = row["origin"];
    items.push({index: {_index: "origin-index", _type: "all", _id: origin}}, {origin});
  });
}

function insertIntoES(rows) {
  for(let i=0; i<100;  i=i+50) {
    console.log(`inserting from ${i} to ${i + 50}`);
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
  insertIntoES(rows);
}).catch(err => {
  console.log(err);
});
