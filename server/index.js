const express = require('express');

const app = express();

let selectedIndex = 0;
const targets = ['raspberry pi', 'cool one', 'linux', 'swag shit'];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  next();
});

app.get('/targets', (req, res) => {
  res.jsonp(targets.map((target, index) => ({
    target,
    selected: selectedIndex === index,
  })));
});
app.get('/targets/target', (req, res) => {
  res.send(targets[selectedIndex]);
});
app.post('/targets/:target', (req, res) => {
  const target = req.params.target;
  const requestedSelectedIndex = targets.indexOf(target);
  if (requestedSelectedIndex >= 0){
    selectedIndex = requestedSelectedIndex;
  }
  res.send('ok');
});

app.listen(3000);