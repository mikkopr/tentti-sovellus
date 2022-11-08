
const {getDbConnConfig} = require('./dbConnConfig');
const {addExam, fetchExam, fetchExams} = require('./examHandlers');
const {addQuestionToExam, addAnswerToQuestion, fetchQuestions, fetchAnswers, updateAnswer, removeQuestionFromExam} = require('./questionHandlers');

const {Pool, Client} = require('pg');

const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

const dbConnPool = new Pool(getDbConnConfig());

app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const validateReqParamId = (value) =>
{
  const regExp = /^\d+$/;
  const match = value.match(regExp);
  return (match != null) ? value : undefined;
}

const validateQueryValueString = (value) => 
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
}

app.get('/', async (req, res) => {
  console.log('GET request');
  res.status(200).send('GET request received');
});

/******************
 * Exam
 */

app.get('/tentit', async (req, res) => {
  console.log('GET /tentit');
  let examRows = undefined;
  try {
    examRows =await fetchExams(dbConnPool);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(examRows);
});

//TODO regexp in parentheses does not work, node version?
//app.get('/tentti/:examId(\d+)', async (req, res) => {
app.get('/tentti/:examId', async (req, res) => {
  console.log('GET /tentti/id');
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam == undefined) {
    res.status(404).send('Invalid http requets parameter');
    return;
  }
  let examRow = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    examRow = await fetchExam(dbConnPool, examIdNr);
    console.log('Exam:', examRow);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(examRow);
});

/**
 * Adds a new exam
 */
app.post('/tentti', async (req, res) => 
{  
  try {
    await addExam(dbConnPool, req.body);
  }
  catch (err) {
    res.status(500).send('Database query error: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send('Exam added');
});

/******************
 * Question
 */

/**
 * Add a new question to the exam
 */
app.post('/tentti/:examId/kysymys', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(404).send('Invalid http request parameter');
    return;
  }
  try {
    await addQuestionToExam(dbConnPool, examIdParam, req.body);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
  res.status(200).send('Question added');  
});

/**
 * Adds the existing question to the exam
 */
app.post('/tentti/:examId/kysymys/:questionId', async (req, res) => 
{
  console.log('NOT IMPLEMENTED');
  res.status(200).send('NOT IMPLEMENTED');
});

/**
 * Removes the question from the exam. Doesn't delete the question in kysymys table.
 */
app.delete('/tentti/:examId/kysymys/:questionId', async (req, res) =>
{
  const examIdParam = validateReqParamId(req.params.examId);
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (examIdParam === undefined || questionIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let deletedRow = undefined;
  try {
    deletedRow = await removeQuestionFromExam(dbConnPool, examIdParam, questionIdParam);
    if (deletedRow !== undefined) {
      res.status(204).end();
    }
    else {
      res.status(404).send("Not found");
    }
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
});

app.get('/tentti/:examId/kysymykset', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let questionRows = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    questionRows = await fetchQuestions(dbConnPool, examIdNr);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(questionRows);
});

/***************
 * Answer
 */

app.get('/kysymys/:questionId/vastaukset', async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(404).send('Invalid http request parameter');
    return;
  }
  let answerRows = undefined;
  try {
    const questionIdNr = new Number(questionIdParam);
    answerRows = await fetchAnswers(dbConnPool, questionIdNr);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(answerRows);
});

/**
 * Updates the question
 */
app.post('/kysymys/:questionId', async (req, res) => 
{
});

/**
 * Adds a new answer to the question
 */
app.post('/kysymys/:questionId/vastaus', async (req, res) => 
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(404).send('Invalid http request parameter');
    return;
  }
  try {
    await addAnswerToQuestion(dbConnPool, questionIdParam, req.body);
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
  res.status(200).send('Answer added');  
});

/**
 * Updates the answer
 */
app.put('/vastaus/:answerId', async (req, res) => 
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
    const updatedAnswer = await updateAnswer(dbConnPool, answerIdParam, req.body);
    //Undefined result means that not found
    if (updatedAnswer !== undefined) {
      res.status(204).end();  
    }
    else {
      res.status(404).end();
    }
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});
