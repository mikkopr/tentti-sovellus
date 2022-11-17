
const express = require('express');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db');
const validators = require('../validateFunctions');

const router = express.Router();

router.post("/login", async (req, res) =>
{
	const receivedPassword = req.body.password;
	const receivedEmail = req.body.email;
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
		passwordMatch = await bcrypt.compare(receivedPassword, existingUser.password);
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
		const role = existingUser.admin ? 'admin' : 'user';
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email, role: role},
      'tokensecret', //TODO dotenv
      {expiresIn: '1h'}
    );
  }
	catch (err) {
    console.log('ERROR: Authentication failed in /login: ', err.message);
    res.status(500).send('ERROR: authentication failed.');
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
				role: 'user' //TODO
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

module.exports = router;
