
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {fetchQuestions, fetchQuestion, addAnswerToQuestion, fetchAnswers, fetchAnswersWithoutCorrectness, updateQuestion} = require('../questionFunctions');
const {fetchExamIdsContainingQuestion} = require('../examQuestionsFunctions');
const {verifyToken, verifyAdminRole, validateReqParamId, userInRole} = require('../validateFunctions');
const roles = require('../roles');

const router = express.Router();

/**
 * Handles /kysymykset
 */

router.get('/', verifyToken, async (req, res) => 
{
	try {
		const questionRows = await fetchQuestions(dbConnPool());
		res.status(200).send(questionRows);
	}
	catch (err) {
		res.status(500).send('Database query failed');
		console.log('Database query error:', err);
		return;
	}
});

router.get('/:questionId', verifyToken, async (req, res) => 
{
	const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam == undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  let questionRow = undefined;
  try {
    const questionIdNr = new Number(questionIdParam);
    questionRow = await fetchQuestion(dbConnPool(), questionIdNr);
    if (questionRow !== undefined) {
      res.status(200).send(questionRow);
    }
    else {
      res.status(204).end();
    }
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
});

/**
 * Updates the question. Updates only the attributes that aren't related to a particular exam.
 */
router.put('/:questionId', verifyToken, verifyAdminRole, async (req, res) => 
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
 router.post('/:questionId/vastaus', verifyToken, verifyAdminRole, async (req, res) => 
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

router.get('/:questionId/vastaukset', verifyToken, async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
	try {
		const includeCorrectness = (req.query.oikeat && await userInRole(req.decodedToken, roles.roles().admin)) ? true : false;
  	let answerRows = undefined;
    const questionIdNr = new Number(questionIdParam);
		if (includeCorrectness)
    	answerRows = await fetchAnswers(dbConnPool(), questionIdNr);
		else
			answerRows = await fetchAnswersWithoutCorrectness(dbConnPool(), questionIdNr);
		res.status(200).send(answerRows);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
});

router.delete('/:questionId', verifyToken, verifyAdminRole, async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
	let client = undefined;
  try {
		client = await pool.connect();
		await client.query('BEGIN');

		// Check if the question is linked to an exam
		let text = "SELECT tentti_id FROM tentti_kysymys_liitos WHERE kysymys_id=$1";
		let values = [questionId];
		let result = await client.query(text, values);
		if (result.length > 0) {
			await client.query('ROLLBACK');
			res.status(400).send('One or more exams contain the question to be deleted.');
			return;
		}

		text = "DELETE FROM tentti_kysymys_liitos WHERE kysymys_id=$1";
		values = [questionId];
		await client.query(text, values);

		text = "DELETE FROM vastaus WHERE kysymys_id=$1";
		values = [questionId];
		await client.query(text, values);

		text = "DELETE FROM kysymys WHERE id=$1";
		values = [questionId];
		await client.query(text, values);

		await client.query('COMMIT');
		res.status(204).end();
	}
	catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
	finally {
		client.release();
	}
});

module.exports = router;
