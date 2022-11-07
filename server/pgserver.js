

const {getDbConnConfig} = require('./dbConnConfig');
const {addExam, fetchExam, fetchExams} = require('./examHandlers');
const {addQuestionToExam, addAnswerToQuestion, fetchQuestions, fetchAnswers} = require('./questionHandlers');

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
    res.status(404).send('Invalid request parameter');
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

//TODO: send the data in body
app.post('/tentti', async (req, res) => {
  console.log('POST /tentti');
  const name = validateQueryValueString(req.query.nimi);
  const description = validateQueryValueString(req.query.kuvaus);
  const dateString = validateQueryValueDateString(req.query.pvm);
  if (name === undefined || description === undefined || dateString === undefined) {
    res.status(404).send('Invalid query parameter');
    return;
  }
  try {
    await addExam(dbConnPool, name, description, new Date(dateString));
    //await addExam(dbConnPool, 'tentti2', 'kuvaus2', new Date('2022-11-15'));
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

//TODO: send the data in body
app.post('/tentti/:examId/kysymys', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  const text = validateQueryValueString(req.query.teksti);
  const questionNr = validateQueryValueNumber(req.query.kysymysNr, 1, 10000);
  if (examIdParam === undefined || text === undefined || questionNr === undefined) {
    res.status(404).send('Invalid query parameter');
    return;
  }
  try {
    await addQuestionToExam(dbConnPool, text, examIdParam, new Number(questionNr));
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
  res.status(200).send('Question added');  
});

a

/***************
 * Answer
 */

app.get('/kysymys/:questionId/vastaukset', async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(404).send('Invalid request parameter');
    return;
  }
  let answerRows = undefined;
  try {
    const questionIdNr = new Number(questionIdParam);
    answerRows = await fetchAnswers(dbConnPool, questionIdNr);
  }
  catch (err) {
    res.status(500).send('Database query failed');
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send(answerRows);
});

