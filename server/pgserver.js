
const {dbConnPool} = require('./db');
const {addExam, fetchExam, fetchExams} = require('./examHandlers');
const {addQuestionToExam, addAnswerToQuestion, fetchQuestions, fetchAnswers, updateAnswer, updateQuestion, updateQuestionOnly, removeQuestionFromExam} = require('./questionHandlers');
const {assignUserToExam} = require('./examAssignmentFunctions');

const {Pool, Client, DatabaseError} = require('pg');

const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

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

/*****************
 * User
 */

app.get('/kayttajat', async (req, res) => {
});

app.get('/kayttajat/:userId', async (req, res) => {
});

app.post('/kayttajat', async (req, res) => {
});

app.put('/kayttajat/:userId', async (req, res) => {
});

app.delete('/kayttajat/:userId', async (req, res) => {
});

/******************
 * Exam assingments
 */

/**
 * Returns the assingments of the user
 */
app.get('/tenttiSuoritukset/kayttaja/:userId', async (req, res) => { 
});

/**
 * Returns the assigned users of the exam
 */
app.get('/tenttiSuoritukset/tentti/:examId', async (req, res) => { 
});

/**
 * Assings the user to the exam.
 */
app.post('/tenttiSuoritukset/kayttaja/:userId/tentti/:examId', async (req, res) =>
{
  const userId = validateReqParamId(userId);
  const examId = validateReqParamId(examId);
  if (userId === undefined || examId === undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  try {
    const assingment = await assignUserToExam(dbConnPool(), userId, examId);
    res.status(200).send(assingment);
  }
  catch (err) {
    if (err instanceof DatabaseError) {
      if (err.code == 23505) {
        res.status(400).send('ERROR: Käyttäjä on jo ilmoittautunut tenttiin: ' + err.message);
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
 * Updates the assingment of the user
 */
app.put('/tenttiSuoritukset/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

/**
 * Deletes the assingment of the user
 */
 app.put('/tenttiSuoritukset/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

/******************
 * Exam
 */

app.get('/tentit', async (req, res) => {
  console.log('GET /tentit');
  let examRows = undefined;
  try {
    examRows = await fetchExams(dbConnPool());
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
app.get('/tentit/:examId', async (req, res) => {
  console.log('GET /tentti/id');
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam == undefined) {
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  let examRow = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    examRow = await fetchExam(dbConnPool(), examIdNr);
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
app.post('/tentit', async (req, res) => 
{  
  try {
    await addExam(dbConnPool(), req.body);
  }
  catch (err) {
    res.status(500).send('Database query error: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
  res.status(200).send('Exam added');
});

/******************
 * Exam questions
 */

/**
 * Add a new question to the exam
 */
app.post('/tenttikysymykset/tentti/:examId/kysymys', async (req, res) => 
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
        res.status(400).send('ERROR: Tenttiä tai kysymystä ei löydy: ' + err.message);
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
app.post('/tenttikysymykset/tentti/:examId/kysymys/:questionId', async (req, res) => 
{
  console.log('NOT IMPLEMENTED');
  res.status(200).send('NOT IMPLEMENTED');
});

/**
 * Removes the question from the exam. Doesn't delete the question in kysymys table.
 */
app.delete('/tenttikysymykset/tentti/:examId/kysymys/:questionId', async (req, res) =>
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
app.get('/tenttikysymykset/tentti/:examId/kysymykset', async (req, res) => 
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  let questionRows = undefined;
  try {
    const examIdNr = new Number(examIdParam);
    questionRows = await fetchQuestions(dbConnPool(), examIdNr);
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
app.put('/tenttikysymykset/tentti/:examId/kysymys/:questionId', async (req, res) => 
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
    const updatedQuestion = await updateQuestion(dbConnPool(), examIdParam, questionIdParam, req.body);
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedQuestion !== undefined) {
      res.status(200).send(updatedQuestion);
    }
    else {
      res.status(400).send('ERROR: kysymystä ei löydy');
    }
  }
  catch (err) {
    if (err instanceof DatabaseError) {
      if (err.code == 23503) {
        res.status(400).send('ERROR: Tenttiä ei löydy: ' + err.message);
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


/******************
 *  Questions
 */

/**
 * Updates the question. Updates only the attributes that aren't related to a particular exam.
 */
 app.put('/kysymykset/:questionId', async (req, res) => 
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
     const updatedQuestion = await updateQuestionOnly(dbConnPool(), questionIdParam, req.body);
      //Undefined result means that not found, postgres doesn't throw error
      if (updateQuestion !== undefined) {
       res.status(200).send(updateQuestion);
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
 app.post('/kysymykset/:questionId/vastaus', async (req, res) => 
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

app.get('/kysymykset/:questionId/vastaukset', async (req, res) =>
{
  const questionIdParam = validateReqParamId(req.params.questionId);
  if (questionIdParam === undefined) {
    res.status(404).send('Invalid http request parameter');
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

/******************
 * Answers
 */

/**
 * Updates the answer. Doesn't create a new answer if doesn't exist.
 */
app.put('/vastaukset/:answerId', async (req, res) => 
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
    const updatedAnswer = await updateAnswer(dbConnPool(), answerIdParam, req.body);
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedAnswer !== undefined) {
      res.status(200).send(updatedAnswer);
    }
    else {
      res.status(400).send('ERROR: vastausta ei löydy');
    }
  }
  catch (err) {
    res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
  }
});
