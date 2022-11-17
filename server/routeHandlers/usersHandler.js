
const express = require('express');

const {dbConnPool} = require('../db');
const {verifyToken, verifyAdminRole, validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /kayttajat
 */

router.get('/', verifyToken, verifyAdminRole, async (req, res) => 
{
  const text = "SELECT * FROM kayttaja ORDER BY nimi ASC";
  try {
    const result = await dbConnPool().query(text);
    res.status(200).send(result?.rows);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});

router.get('/:userId', verifyToken, async (req, res) => 
{
  const userIdParam = validateReqParamId(req.params.userId);
  if (userIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
	//Admin role required to edit other users' data
	if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
  const text = "SELECT (id, nimi, email, admin) FROM kayttaja WHERE id=$1";
  const values = [userIdParam];
  try {
    const result = await dbConnPool().query(text, values);
    if (result?.rows !== undefined) {
      res.status(200).send(result.rows[0]);
    }
    else {
      //No content
      res.status(204).end();
    }
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});

router.post('/', verifyToken, verifyAdminRole, async (req, res) => 
{
  const data = req.body;
  if (data === undefined || data.nimi === undefined || data.email === undefined || data.admin === undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  const text = "INSERT INTO kayttaja (nimi, email, admin) VALUES ($1, $2, $3) RETURNING *";
  const values = [data.nimi, data.email, data.admin];
  try {
    const result = await dbConnPool().query(text, values);
    res.status(201).send(result.rows[0]);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});

router.put('/:userId', verifyToken, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
  if (userIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || data.nimi === undefined || data.email === undefined || data.admin === undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
	//Admin role required to edit other users' data
	if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	//No self promotes
	if (req.decodedToken.role != 'admin') {
		data.admin = false;
	}
	try {
		const text = "UPDATE kayttaja SET nimi=$1, admin=$2 WHERE id=$3 RETURNING *";
  	const values = [data.nimi, data.admin, userIdParam];
  	const result = await dbConnPool().query(text, values);
    if (result.rows[0] !== undefined) {
        res.status(200).send(result.rows[0]);
    }
    else {
      res.status(404).send({sender: 'application', message: 'User not found'});
    }
  }
  catch (err) {
      res.status(500).send('ERROR: ' + err.message);
      console.log('ERROR: ', err);
      return;
  }
});

router.delete('/:userId', verifyToken, verifyAdminRole, async (req, res) =>
{
	const userIdParam = validateReqParamId(req.params.userId);
  if (userIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
	let client = undefined;
  try {
		client = await dbConnPool().connect();
		await client.query('BEGIN');
		let text = "DELETE FROM tentti_suoritus WHERE kayttaja_id=$1";
		let values = [userIdParam];
		await client.query(text, values);

		text = "DELETE FROM kayttaja WHERE id=$1";
		await client.query(text, values);
    
		await client.query('COMMIT');
    res.status(204).end();
  }
  catch (err) {
		await client.query('ROLLBACK');
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
	finally {
		client?.release();
	}
});

module.exports = router;
