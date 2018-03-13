const AWS =  require('aws-sdk');

const options = {
  hosts: ["https://search-crux-staging-4xqx45vugm4qywnwcq7draso2m.us-east-1.es.amazonaws.com"],
  connectionClass: require("http-aws-es"),
  awsConfig: new AWS.Config({
    accessKeyId: "AKIAIPO2UAKQ2N22NRWQ",
    secretAccessKey: "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",
    region: "us-east-1"
  }),
  httpOptions: {}
};

const client = require("elasticsearch").Client(options);

const items = [];

const BigQuery = require("@google-cloud/bigquery");

const projectId = ""; // Add project id

const bigQuery =  new BigQuery({
  projectId: projectId,
  credentials: require("") // Add path to json file credentials
});

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
