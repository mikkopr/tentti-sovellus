const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8081;
const dataFile = './server/examData.json';
const credentialsFile = './server/credentials.json';

/*app.use(cors({
    origin: 'http://localhost:8080'
}));*/
app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.get('/', async (req, res) => {
  console.log('GET request');

  /*let verifiedUser = null;
  try {
    verifiedUser = await verifyCredentials(req.body?.user, credentialsFile);
    console.log("credentials verification done");
    if (verifiedUser == null) {
      console.log("Incorrect credentials");
      res.status(403).send('Incorrect credentials');
      return;
    }
  }
  catch (error) {
    res.status(500).send('Failed to verify user credentials: ' + error.message);
    return;
  }*/
  
  try {
    const data = await fs.readFile(dataFile, { encoding: 'utf8', flag: 'r' });
    res.send(data);
  }
  catch (error) {
    console.log('File read error: ', err.message);
    res.status(400).send('Failed to read the data file');
    return;
  }
});

app.post('/login', async (req, res) => {
  console.log("POST request: /login");
  let verifiedUser = null;
  try {
    verifiedUser = await verifyCredentials(req.body, credentialsFile);
    console.log("credentials verification done");
    if (verifiedUser == null) {
      console.log("Incorrect credentials");
      //res.status(403).send('Username or password is incorrect');
      res.status(403).send(JSON.stringify({verified: false}));
      return;
    }
  }
  catch (error) {
    console.log('Failed to verify user credentials: ' + error.message);
    res.status(500).send('Failed to verify user credentials: ' + error.message);
    return;
  }
  res.send(JSON.stringify({...verifiedUser, verified: true}));
});

app.post('/', async (req, res) => {
  console.log("POST request: /");  
  let verifiedUser = null;
  try {
    verifiedUser = await verifyCredentials(req.body?.user, credentialsFile);
    console.log("credentials verified");
    if (verifiedUser == null || !verifiedUser.admin) {
      console.log("No permissions to modify");
      res.status(403).send('User has no permission to modify the data');
      return;
    }
  }
  catch (error) {
    console.log('Failed to verify user credentials: ' + error.message);
    res.status(500).send('Failed to verify user credentials: ' + error.message);
    return;
  }
  //Save the received data
  const dataCopy = JSON.parse(JSON.stringify(req.body));
  try {
    await fs.writeFile(dataFile, JSON.stringify(dataCopy));
    console.log('Data saved');
    res.send(JSON.stringify(dataCopy));
  }
  catch (error) {
    console.log('Failed to save data: ' + error.message);
    res.status(500).send('Write error: ' + error.message);
    return;
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

/**
 * Verifies user credentials. Returns a credential object if an user
 * is found and the password is correct. Otherwise returns null.
 * 
 * May throw exceptions due to file read
 */
const verifyCredentials = async (user, credentialsFile) => 
{
  console.log('verifyCredentials');
  if (user === undefined || user.name === undefined || user.password === undefined) {
    console.log('user === undefined || user.name === undefined || user.password === undefined');
    return null;
  }
  let data = await fs.readFile(credentialsFile, { encoding: 'utf8', flag: 'r' });
  const jsonData = JSON.parse(data);
  //console.log('verifyCredentials jsonData:', jsonData);
  const matchingUser = jsonData.users.find(item => {
    if (item.name === user.name) {
      console.log('User found');
      return true;
    }
  });
  if (matchingUser === undefined) {
    console.log('matchingUser === undefined');
    return null;
  }
  if (matchingUser.password !== user.password) {
    console.log('matchingUser === undefined');
    return null;
  }
  if (matchingUser.admin === true) {
    console.log('{...matchingUser, admin: true}');
    return matchingUser;
  }
  else {
    console.log('{...matchingUser, admin: false}');
    return {...matchingUser, admin: false};
  }
};
