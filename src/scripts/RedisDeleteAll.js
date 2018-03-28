const redis = require("redis");
const { RedisHost, RedisPort } = require("./env.js");

var client = redis.createClient({
  port: RedisPort, 
  host: RedisHost
});

client.flushdb( function (err, res) {
  if(res) {
    console.log(res);
    process.exit();
  } else {
    console.log(err);
    process.exit();
  }
});