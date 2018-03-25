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

function prepareResult(rows) {
  const items = [];
  console.log(`received ${rows.length} rows`);
  rows.forEach(row => {
    let origin = row["origin"];
    items.push({index: {_index: "origin-index", _type: "all", _id: origin}}, {origin});
  });
  return items;
}

async function insertIntoESPromise(items) {
  return new Promise((resolve, reject) => {
    client.bulk({
      body: items,
      timeout: "15m"
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
  const batchSize = 10000;
        console.log(rows.length);
  for(let i=2940000; i<=rows.length;  i=i+batchSize) {
    console.log(`inserting from ${i} to ${i + batchSize}`);
    await insertIntoESPromise(rows.slice(i, i+ batchSize));
  }
}

function writeOrigins(rows) {
  const fs = require('fs');
  fs.writeFileSync('origins.txt', JSON.stringify(rows));
}


// bigQuery.query(queryOption).then(async (results) => {
//   const rows = results[0];
//   // writeOrigins(rows);
//   //await insertIntoES(prepareResult(rows));
// }).catch(err => {
//   console.log(err);
// });


async function run() {
  const fs = require('fs');
  const rows = JSON.parse(fs.readFileSync('origins.txt'));
  console.log(rows.length);
  await insertIntoES(prepareResult(rows));
}

run();