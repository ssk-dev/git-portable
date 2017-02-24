let fsl = require('./file-storage-handler');
const bodyParser = require("body-parser");
const express = require('express');
const app = express();

const port = 9998;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, HEAD, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('*', (req, res) => {
  res.send('fs')
});

app.post('/create/root', async (req, res, next) => {
  console.log('req.body', req.body);
  await fsl.createRootStorage();
  res.status(200).send({status: fsl.getStatus()});
  next();
});

app.listen(port, () => {
  console.log("File server running on: http://localhost:" + port + "!");
});
