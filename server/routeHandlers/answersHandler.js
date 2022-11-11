
const express = require('express');

const {dbConnPool} = require('../db');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /vastaukset
 */

 router.get('/:answerId', async (req, res) => 
 {
  res.status(200).send('NOT IMPLEMENTED');
 });

/**
 * Updates the answer. Doesn't create a new answer if doesn't exist.
 */
router.put('/:answerId', async (req, res) => 
{
  const answerIdParam = validateReqParamId(req.params.answerId);
  if (answerIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || data.teksti === undefined || data.oikein === undefined) {
    res.status(400).send('Invalid http request parameter');
  }
  try {
    const text = "UPDATE vastaus SET teksti=$1, oikein=$2 WHERE id=$3 RETURNING *";
    const values = [data.teksti, data.oikein, answerId];
    const result = await dbConnPool().query(text, values);
    const updatedAnswer = result.rows[0];
    
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedAnswer !== undefined) {
      res.status(200).send(updatedAnswer);
    }
    else {
      res.status(404).send('ERROR: Answer not found');
    }
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});

module.exports = router;
