
const {dbConnPool} = require('./db');
const jwt = require('jsonwebtoken');

const verifyAdminRole = (req, res, next) =>
{
	if (!req.decodedToken) {
		res.status(403).send('ERROR: Token was not provided.');
		return;
	}
	if (req.decodedToken.role !== 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	next();
}

const verifyToken = (req, res, next) =>
{
	const token = req.headers.authorization?.split(' ')[1]; 
	//Use header Authorization: 'Bearer TOKEN'
	if (!token) {
		res.status(403).send('ERROR: Token was not provided.');
		return;
	}
	let decodedToken = undefined;
	try {
		decodedToken = jwt.verify(token, "tokensecret"); //TODO
	}
	catch (err) {
		res.status(403).send("ERROR: Invalid token");
		return;
	}
	req.decodedToken = decodedToken;
	next();
}

/**
 * Verifies that the email and password fulfill the requirements and the email isn't
 * already registered.
 */
const validateRegistrationEmailAndPassword = async (req, res, next) =>
{
	const {email, password} = req.body;
	
	//TODO
	if (!email || email.length === 0) {
		res.status(400).send('Käyttäjätunnus ei kelpaa');
		return;
	}
	if (!password || !password.length > 3) {
		res.status(400).send('Salasana ei täytä vaatimuksia');
		return;
	}

	//check if email already exists
  try {
    const result = await dbConnPool().query("SELECT id FROM kayttaja WHERE email=$1", [email]);
		if (result.rows.length > 0) {
			res.status(409).send('Käyttäjätunnus on jo käytössä');
			return;
		}
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err.message);
    return;
  }
	next();
}

const validateReqParamId = (value) =>
{
  const regExp = /^\d+$/;
  const match = value.match(regExp);
  return (match != null) ? value : undefined;
}

/*const validateQueryValueString = (value) => 
{
  if (value === undefined || value.length > 200) {
    return undefined;
  }
  return value;
}

const validateQueryValueDateString = (value) => 
{
  if (value === undefined || value.length > 200) {
    return undefined;
  }
  //still accepts invalid month and day values
  const regExpDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}&/;
  const matches = value.match(regExpDate);
  return (matches != null && matches.length == 1) ? value : undefined;
}

const validateQueryValueNumber = (value, min, max) =>
{
  if (value === undefined) {
    return undefined;
  }
  const regExp = /^\d+$/;
  const match = value.match(regExp);
  if (match == null) {
    return undefined;
  }
  const num = new Number(value);
  return (num >= min && num <= max) ? value : undefined;
}*/

module.exports = {verifyToken, verifyAdminRole, validateRegistrationEmailAndPassword, validateReqParamId};
