"use strict";

const AWS =  require('aws-sdk');
const BigQuery = require("@google-cloud/bigquery");
const env = require("./env.js");

const projectId = env.BigQueryProjectId;
const { googleApplicationCredentials, dataSetName, ESHost } = env;

const options = {
  hosts: [ESHost],
  connectionClass: require("http-aws-es"),
  awsConfig: new AWS.Config({ region: 'us-east-1' }),
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

async function insertIntoESPromise(items) {
  return new Promise((resolve, reject) => {
    client.bulk({
      body: items
    }, (err, res) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(res);
        resolve(res);
      }
    })
  });
}

async function insertIntoES(rows) {
  const batchSize = 1000;
  for(let i=0; i<=rows.length;  i=i+batchSize) {
    console.log(`inserting from ${i} to ${i + batchSize}`);
    try {
      await insertIntoESPromise(items.slice(i, i+ batchSize));
    } catch(err) {
      console.log(err);
    }
  }
}

bigQuery.query(queryOption).then(async (results) => {
  const rows = results[0];
  printResult(rows);
  await insertIntoES(rows);
}).catch(err => {
  console.log(err);
});
