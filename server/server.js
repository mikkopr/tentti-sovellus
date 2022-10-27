const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;
const dataFile = './examData.json';

/*app.use(cors({
    origin: 'http://localhost:8080'
}));*/
app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.get('/', (req, res) => {
  console.log('GET request');
  fs.readFile(dataFile, { encoding: 'utf8', flag: 'r' }, (err, data) => {
    if (err) {
      console.log('File read error: ', err.message);
      res.status(400).send('Failed to read the data file');
      return;
    }
    res.send(data);
  });
})

app.post('/', (req, res) => {
  console.log("POST request");
  //console.log(req.body);
  if (req.body !== 'undefined') {
    fs.writeFile(dataFile, JSON.stringify(req.body), (err) => {
      if (err) {
        res.status(500).send('Write error: ' + err.message);
        return;
      }
      else {
        res.send('Data writed');
      }
    });
  }
  else {
    res.status(400).send('No data received');
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
