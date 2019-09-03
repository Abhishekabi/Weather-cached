const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");
const path = require("path");

const favicon = require("express-favicon");

const appid = "082ba4ed05108a707d6a811fd235e709";
const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const app = express();
const client = redis.createClient(REDIS_PORT);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(__dirname + "/public/favicon.png"));

function sendData(city, { temp, humid, desc }) {
  return {
    city: city,
    temp: temp,
    humid: humid,
    desc: desc
  };
}

// Middleware to check if data is cached
function checkCache(req, res, next) {
  console.log("cached response");
  const { city } = req.params;
  client.hgetall(city, function(err, obj) {
    if (err) throw err;
    if (obj !== null && Object.keys(obj).length > 0) {
      res.send(sendData(city, obj));
    } else {
      next();
    }
  });
}

const getWeather = async function(req, res) {
  console.log("initial request");
  try {
    let { city } = req.params;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${appid}`
    );
    const data = await response.json();
    if (data.message) {
      res.send(data);
      return;
    }
    let objData = {
      temp: data.main.temp,
      humid: data.main.humidity,
      desc: data.weather[0].description
    };
    client.HMSET(city.trim().toLowerCase(), objData);
    res.send(sendData(city, objData));
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/weather/:city", checkCache, getWeather);

app.listen(PORT, () => console.log(`server running at port ${PORT}`));
