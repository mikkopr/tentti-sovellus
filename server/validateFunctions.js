
const {dbConnPool} = require('./db');
const jwt = require('jsonwebtoken');
const roles = require('./roles');

/**
 * Returns true if the user having the email is in the role.
 */
const userInRole = async (decodedToken, role) =>
{
	try {
		//Check first from the token
		if (decodedToken?.role != role) {
			return false;
		}
		//Currently no role tables, checks only admin boolean
		const result = await dbConnPool().query(
			"SELECT admin FROM kayttaja WHERE email=$1", [decodedToken.email]);
		if (result.rows[0] && result.rows[0].admin)
			return true;
		else
			return false;
	}
	catch (err) {
    console.log('ERROR: Failed to verify role: ' + role + ': ' + err.message);
    throw err;
	}
}

const verifyAdminRole = async (req, res, next) =>
{
	if (!req.decodedToken) {
		res.status(403).send('ERROR: Token was not provided.');
		return;
	}
	if (req.decodedToken.role != roles.roles().admin) {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	try {
		//Admin role is verified also from the database. Other roles may be verified from the token, if the role
		//change must not have to be immediate
		const result = await dbConnPool().query(
			"SELECT admin FROM kayttaja WHERE email=$1", [req.decodedToken.email]);
		if (result.rows[0]?.admin) {
			next();
			return;
		}
		else {
			res.status(403).send('Ei käyttöoikeutta');
			return;
		}
	}
	catch (err) {
		res.status(500).send('ERROR: Failed to verify admin role');
    console.log('ERROR: Failed to verify admin role: ', err.message);
    return;
	}
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
		//If expired err.name == TokenExpiredError
		res.status(401).send("ERROR: Invalid token");
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

const validateNumber = (value, min, max) =>
{
	const num = Number(value);
	if (isNaN(num) || num < min || num > max)
		return false;
	else
		return true;
}

const validateDate = (value) =>
{
	if (!value || typeof value !== 'string')
		return false;
	const regExp = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}([zZ]|\.\d{1,3}[zZ])/;
	const match = value.match(regExp);
	return match ? true : false;
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

module.exports = {verifyToken, verifyAdminRole, validateRegistrationEmailAndPassword, validateReqParamId, validateNumber, 
	validateDate,  userInRole};
