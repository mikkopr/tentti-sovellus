const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;
const dataFile = './examData.json';
const credentialsFile = './credentials.json';

/*app.use(cors({
    origin: 'http://localhost:8080'
}));*/
app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.get('/', async (req, res) => {
  console.log('GET request');
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

app.post('/', async (req, res) => {
  console.log("POST request");
  //console.log(req.body);
  if (req.body === undefined) {
    res.status(400).send('No data received');
    return;
  }  
  let verifiedUser = null;
  try {
    verifiedUser = await verifyCredentials(req.body, credentialsFile);
    console.log("credentials verified");
    if (verifiedUser == null || !verifiedUser.admin) {
      console.log("No permissions");
      res.status(403).send('User has no permission to modify the data');
      return;
    }
  }
  catch (error) {
    res.status(500).send('Failed to verify user credentials: ' + error.message);
    return;
  }
  /*//Save verified user credentials with the other data
  const dataCopy = JSON.parse(JSON.stringify(req.body));
  dataCopy.user = verifiedUser;

  try {
    await fs.writeFile(dataFile, JSON.stringify(dataCopy));
  }
  catch (error) {
    res.status(500).send('Write error: ' + error.message);
    return;
  }*/

  res.send(JSON.stringify(verifiedUser));
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
const verifyCredentials = async (reqBody, credentialsFile) => 
{
  console.log('verifyCredentials');
  const user = reqBody.user;
  if (user.name === undefined || user.password === undefined) {
    console.log('user.name === undefined || user.password === undefined');
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
