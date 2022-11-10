
const express = require('express');

const {dbConnPool} = require('../db');
const {fetchExams, fetchExam, addExam} = require('../examFunctions');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /tentit
 */

router.get('/', async (req, res) => 
{
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
router.get('/:examId', async (req, res) => 
{
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
 router.post('/', async (req, res) => 
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

module.exports = router;
