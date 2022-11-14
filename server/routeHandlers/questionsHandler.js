
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {addAnswerToQuestion, fetchAnswers, updateQuestion} = require('../questionFunctions');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /kysymykset
 */

//TODO get('/:questionId')

/**
 * Updates the question. Updates only the attributes that aren't related to a particular exam.
 */
router.put('/:questionId', async (req, res) => 
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || data.teksti === undefined) {
    res.status(400).send('Invalid http request parameter');
  }
  try {
    const updatedQuestion = await updateQuestion(dbConnPool(), questionIdParam, req.body);
      //Undefined result means that not found, postgres doesn't throw error
    if (updatedQuestion !== undefined) {
        res.status(200).send(updatedQuestion);
    }
    else {
      res.status(400).send('ERROR: kysymystä ei löydy');
    }
  }
  catch (err) {
      res.status(500).send('ERROR: ' + err.message);
      console.log('ERROR: ', err);
      return;
  }
})

/**
 * Adds a new answer to the question
 */
 router.post('/:questionId/vastaus', async (req, res) => 
 {
   const questionIdParam = validateReqParamId(req.params.questionId);
   if (questionIdParam === undefined) {
     res.status(400).send('Invalid http request parameter');
     return;
   }
   const data = req.body;
   if (data == undefined || data.teksti === undefined || data.oikein === undefined) {
     res.status(400).send('Invalid data: received answer data is invalid');
   }
   try {
     const result = await addAnswerToQuestion(dbConnPool(), questionIdParam, req.body);
     res.status(201).send(result);
   }
   catch (err) {
     if (err instanceof DatabaseError) {
       if (err.code == 23503) {
         res.status(400).send('ERROR: kysymystä ei löydy' + err.message);
         console.log('ERROR: DatabaseError', err.message);
       }
       else {
         res.status(500).send('ERROR: Tietokanta ei kyennyt suorittamaan operaatiota');
         console.log('ERROR: DatabaseError', err.message);
       }
     }
     else {
       res.status(500).send('ERROR: ' + err.message);
       console.log('ERROR: ', err.message);
     }
   }
 });

router.get('/:questionId/vastaukset', async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let answerRows = undefined;
  try {
    const questionIdNr = new Number(questionIdParam);
    answerRows = await fetchAnswers(dbConnPool(), questionIdNr);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(answerRows);
});

module.exports = router;
