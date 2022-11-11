
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {addQuestionToExam, fetchExamQuestions, updateExamQuestion, removeQuestionFromExam} = require('../examQuestionsFunctions');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /tenttikysymykset
 */

/**
 * Add a new question to the exam
 */
router.post('/tentti/:examId/kysymys', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data == undefined || data.teksti === undefined || data.kysymys_numero === undefined || 
      data.pisteet === undefined) {
    res.status(400).send('Invalid data: received question data is invalid');
  }
  try {
    const addedQuestion = await addQuestionToExam(dbConnPool(), examIdParam, req.body); 
    res.status(200).send(addedQuestion);
  }
  catch (err) {
    if (err instanceof DatabaseError) {
      // Error 23505, duplicate key, shouldn't be possible
      if (err.code == 23503) {
        res.status(400).send('ERROR: Exam or question not found: ' + err.message);
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
router.post('/tentti/:examId/kysymys/:questionId', async (req, res) => 
{
  console.log('NOT IMPLEMENTED');
  res.status(200).send('NOT IMPLEMENTED');
});

/**
* Removes the question from the exam. Doesn't delete the question in kysymys table.
*/
router.delete('/tentti/:examId/kysymys/:questionId', async (req, res) =>
{
  const examIdParam = validateReqParamId(req.params.examId);
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (examIdParam === undefined || questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  try {
    const deletedRow = await removeQuestionFromExam(dbConnPool(), examIdParam, questionIdParam);
    if (deletedRow !== undefined) {
      res.status(204).end();
    }
    else {
      res.status(404).send("WARNING: Unable to fulfill the request, tentti does not exists");
    }
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
});

/**
* Return questions related to the exam and all data associated with a particular question in the exam,
* such as question number and points.
*/
router.get('/tentti/:examId', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let questionRows = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    questionRows = await fetchExamQuestions(dbConnPool(), examIdNr);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(questionRows);
});

/**
* Updates the question attached to the exam. Doesn't create a new question if doesn't exist.
*/
router.put('/tentti/:examId/kysymys/:questionId', async (req, res) => 
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
      res.status(404).send('ERROR: annettu id puuttu päivitettävästä taulusta');
    }
  }
  catch (err) {
    //TODO: Are all transaction aborts errors?
    res.status(500).send('ERROR: Tietojen päivitys epäonnistui' + err.message);
    console.log('ERROR: ', err.message);
    /*if (err instanceof DatabaseError) {
      if (err.code == 23503) {
        res.status(404).send('ERROR: Tenttiä ei löydy: ' + err.message);
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
    }*/
  }
});

module.exports = router;
