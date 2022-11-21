
const express = require('express');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db');
const validators = require('../validateFunctions');
const roles = require('../roles');

const router = express.Router();

router.get('/', async (req, res) => {
	console.log('TEST');
	res.status(200).send('TEST');
});

router.post("/login", async (req, res) =>
{
	const receivedPassword = req.body.password;
	const receivedEmail = req.body.email;

	if (receivedPassword === undefined || receivedEmail === undefined) {
		res.status(400).send("Tunnus ja salasana vaaditaan");
		return;
	}

  let existingUser = undefined;
	let passwordMatch = false;
  try {
		let result = await db.dbConnPool().query("SELECT * FROM kayttaja WHERE email=$1", [receivedEmail]);
    existingUser = {
			id: result.rows[0]?.id,
			email: result.rows[0]?.email,
			password: result.rows[0]?.password,
			admin: result.rows[0]?.admin
		};
		//If user found verify password
		if (existingUser.id && existingUser.password) {
			passwordMatch = await bcrypt.compare(receivedPassword, existingUser.password);
		}
  }
	catch (err) {
    console.log('ERROR: Authentication failed in /login: ', err.message);
    res.status(500).send('ERROR: Authentication failed');
		return;
  }
	if (!existingUser || !passwordMatch) {
    res.status(401).send('Käyttäjänimi tai salasana virheellinen');
		return;
  }
  let token;
  try {
		//TODO create a roles table and query the roles of the user
		const role = existingUser.admin ? roles.roles().admin : roles.roles().user;
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email, role: role},
      'tokensecret', //TODO dotenv
      {expiresIn: '2h'}
    );
  }
	catch (err) {
    console.log('ERROR: Authentication failed in /login: ', err.message);
    res.status(500).send('ERROR: authentication failed.');
		return;
  }
 
	res.status(200).send(
		{	userId: existingUser.id,
      email: existingUser.email,
			role: existingUser.role,
      token: token,
    });
});

router.post("/register", validators.validateRegistrationEmailAndPassword, async (req, res) =>
{
  const {email, password, name} = req.body;
	if (!name) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	const newUser = {email: email, name: name, admin: false};
	let result = undefined;
  try {
		//TODO
		const saltRounds = 10;
		let hashedPassword = await bcrypt.hash(password, saltRounds);
		newUser.password = hashedPassword;
		result = await db.dbConnPool().query(
			"INSERT INTO kayttaja (nimi, email, password, admin) VALUES ($1, $2, $3, $4) RETURNING id",
			[newUser.name, newUser.email, hashedPassword, newUser.admin]);
		newUser.id = result.rows[0].id;
  }
	catch (err) {
    if (err instanceof pg.DatabaseError && err.code == 23505) {
			res.status(409).send('Käyttäjätunnus on jo käytössä');
			return;
		}
		res.status(500).send('ERROR: registration failed.');
  }
  let token;
  try {
    token = jwt.sign(
      {	userId: newUser.id,
				email: newUser.email,
				role: roles.roles().user //Initially in user role
			},
      'tokensecret', //TODO
      { expiresIn: '1h' }
    );
  }
	catch (err) {
    res.status(500).send('ERROR: registration failed.');
		return;
  }
  res.status(201).send(
		{	userId: newUser.id,
			email: newUser.email,
			token: token
		});
});

router.get('/timestamptest', async (req, res) => {
	try {
		let testDate = new Date('2022-11-19T10:41:37.977Z');
		console.log('testDate: ', testDate);
		console.log('testDate.toLocaleTimeString(): ', testDate.toLocaleTimeString());
		console.log('testDate.toISOString(): ', testDate.toISOString());
		console.log('testDate.toDateString(): ', testDate.toDateString());

		console.log('Timezone: ', process.env.TZ);
		//process.env.TZ = 'Europe/Helsinki';
		//console.log('Timezone: ', process.env.TZ);
		const createTableText = "CREATE TEMP TABLE dates(date_col DATE, timestamp_col TIMESTAMP, timestamptz_col TIMESTAMPTZ);"
		await db.dbConnPool().query(createTableText)
		// insert the current time into it
		const now = new Date()
		const insertText = 'INSERT INTO dates(date_col, timestamp_col, timestamptz_col) VALUES ($1, $2, $3)'
		await db.dbConnPool().query(insertText, [now, now, now])
		const result = await db.dbConnPool().query('SELECT * FROM dates')
		console.log(result.rows);

		let timestampzResult = await db.dbConnPool().query("SELECT current_timestamp(0)");
		

		res.status(200).send(result.rows);
	}
	catch (err) {
		console.log(err.message);
		res.status(500).send(err.message);
	}
});

module.exports = router;
