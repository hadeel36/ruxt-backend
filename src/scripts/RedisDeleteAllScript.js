const redis = require("redis");
const RedisHost = require("./env.js");
const RedisPort = require("./env.js");

var client = redis.createClient({RedisPort, RedisHost});

client.flushdb( function (err, res) {
  if(res) {
    console.log(res);
  } else {
    console.log(err);
  }
});