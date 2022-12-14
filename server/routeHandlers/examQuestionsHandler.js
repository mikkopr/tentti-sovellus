
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {addQuestionToExam, fetchExamQuestions, updateQuestionDataForExam, removeQuestionFromExam} = require('../examQuestionsFunctions');
const {validateReqParamId, verifyToken, verifyAdminRole, validateNumber} = require('../validateFunctions');

const router = express.Router();

const MAX_VALUE_SMALL_INT = 32768;

/**
 * Handles /tenttikysymykset
 */

/**
 * Add a new question to the exam
 */
router.post('/tentti/:examId/kysymys', verifyToken, verifyAdminRole, async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data == undefined || data.text === undefined || data.number === undefined || 
      data.points === undefined) {
    res.status(400).send('Invalid data: received question data is invalid');
		return;
  }
  try {
    const questionData = await addQuestionToExam(dbConnPool(), examIdParam, req.body); 
    res.status(200).send(questionData);
  }
  catch (err) {
    if (err instanceof DatabaseError) {
      // Error 23505, duplicate key, shouldn't be possible
      if (err.code == 23503) {
        res.status(404).send({sender: 'application', message: 'tentti does not exists'});
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

/**
* Adds the existing question to the exam
*/
router.post('/tentti/:examId/kysymys/:questionId', verifyToken, verifyAdminRole, async (req, res) => 
{
  console.log('NOT IMPLEMENTED');
  res.status(200).send('NOT IMPLEMENTED');
});

/**
* Removes the question from the exam. Doesn't delete the question in kysymys table.
*/
router.delete('/tentti/:examId/kysymys/:questionId', verifyToken, verifyAdminRole, async (req, res) =>
{
  const examIdParam = validateReqParamId(req.params.examId);
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (examIdParam === undefined || questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  try {
    const deletedCount = await removeQuestionFromExam(dbConnPool(), examIdParam, questionIdParam);
    res.status(200).send({count: deletedCount});
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
});

/**
* Return questions related to the exam and all data but answers associated with a particular question in the exam,
* such as question number and points.
*/
router.get('/tentti/:examId', verifyToken, async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let questionDataRows = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    questionDataRows = await fetchExamQuestions(dbConnPool(), examIdNr);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(questionDataRows);
});

/**
* Updates the question data attached to the exam. Doesn't create a new question if doesn't exist.
*/
router.put('/tentti/:examId/kysymys/:questionId', verifyToken, verifyAdminRole, async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (examIdParam === undefined || questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || !validateNumber(data.number, 0, MAX_VALUE_SMALL_INT) || 
			!validateNumber(data.points, 0, MAX_VALUE_SMALL_INT)) {
    res.status(400).send('Request contains invalid data');
  }
  try {
    const updatedData = await updateQuestionDataForExam(dbConnPool(), examIdParam, questionIdParam, req.body);
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedData !== undefined) {
      res.status(200).send(updatedData);
    }
    else {
			res.status(404).send({sender: 'application', message: 'id or ids not found in database'});
    }
  }
  catch (err) {
    res.status(500).send('ERROR: Tietojen p??ivitys ep??onnistui' + err.message);
    console.log('ERROR: ', err.message);
		return;
  }
});

/*router.put('/tentti/:examId/kysymys/:questionId', verifyToken, verifyAdminRole, async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (examIdParam === undefined || questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || data.teksti === undefined || data.kysymys_numero === undefined|| data.pisteet === undefined) {
    res.status(400).send('Invalid http request parameter');
  }
  try {
    const updatedQuestion = await updateExamQuestion(dbConnPool(), examIdParam, questionIdParam, req.body);
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedQuestion !== undefined) {
      res.status(200).send(updatedQuestion);
    }
    else {
			res.status(404).send({sender: 'application', message: 'id or ids not found in database tables'});
    }
  }
  catch (err) {
    //TODO: Are all transaction aborts errors?
    res.status(500).send('ERROR: Tietojen p??ivitys ep??onnistui' + err.message);
    console.log('ERROR: ', err.message);
    /*if (err instanceof DatabaseError) {
      if (err.code == 23503) {
        res.status(404).send('ERROR: Tentti?? ei l??ydy: ' + err.message);
        console.log('ERROR: Exam id not found when updating a question:', err.message);
      }
      else {
        res.status(500).send('ERROR: Tietokanta ei kyennyt suorittamaan operaatiota');
        console.log('ERROR: DatabaseError', err.message);
      }
    }
    else {
      res.status(500).send('ERROR: ' + err.message);
      console.log('ERROR: ', err.message);
    }*/ /*
  }
});*/

module.exports = router;
