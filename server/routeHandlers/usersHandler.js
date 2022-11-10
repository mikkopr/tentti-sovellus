
const express = require('express');

const {dbConnPool} = require('../db');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /kayttajat
 */

router.get('/', async (req, res) => 
{
  const text = "SELECT * FROM kayttajat ORDER BY id ASC";
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

router.get('/:userId', async (req, res) => 
{
  const userIdParam = validateReqParamId(req.params.userId);
  if (userIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const text = "SELECT * FROM kayttajat WHERE id=$1";
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

router.post('/', async (req, res) => 
{
  const data = req.body;
  if (data === undefined || data.nimi === undefined || data.email === undefined || data.admin === undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  const text = "INSERT INTO kayttajat(nimi, email, admin) VALUES($1, $2, $3) RETURNING *";
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

router.put('/:userId', async (req, res) => {
});

router.delete('/:userId', async (req, res) => {
});

module.exports = router;
