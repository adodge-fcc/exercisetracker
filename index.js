const express = require('express')
let bodyParser = require("body-parser");
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// in-memory database
const users = new Map();

const userSelect = (user) => {
  return { _id: user._id, username: user.username };
}

app.route("/api/users")
  .post((req, res) => {
    const { username } = req.body;
    const user = { _id: `${users.size}`, username, log: new Array() };
    users.set(user._id, user);
    res.json(userSelect(user));
  })
  .get((req, res) => {
    res.json(Array.from(users.values()).map(userSelect));
  })

app.route("/api/users/:_id/exercises")
  .post((req, res) => {
    const user_id = req.params._id;
    const { description, duration: duration_string, date: date_string } = req.body;
    const date_obj = (date_string == "" || date_string === undefined) ? new Date() : new Date(date_string);
    const date = date_obj.toDateString();
    const duration = Number(duration_string);

    const user = users.get(user_id);
    const exercise = { description, duration, date };
    user.log.push(exercise);

    res.json({ ...userSelect(user), ...exercise });
  })

app.route("/api/users/:_id/logs")
  .get((req, res) => {
    const user_id = req.params._id;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const date_from = req.query.from ? new Date(req.query.from) : undefined;
    const date_to = req.query.to ? new Date(req.query.to) : undefined;

    /**
     * @type {{log: [{date: Date}]}}
     */
    const user = users.get(user_id);
    let log = Array.from(user.log);
    if (date_from !== undefined)
      log = log.filter((v) => new Date(v.date) >= date_from);

    if (date_to !== undefined)
      log = log.filter((v) => new Date(v.date) <= date_to);

    if (limit !== undefined)
      log = log.slice(0, limit);

    const result = { ...userSelect(user), log, count: log.length };
    res.json(result);
  })



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
