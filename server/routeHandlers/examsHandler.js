
const express = require('express');

const {dbConnPool} = require('../db');
const {fetchExams, fetchExam, addExam, updateExam} = require('../examFunctions');
const {verifyToken, verifyAdminRole, validateReqParamId, validateNumber, validateDate} = require('../validateFunctions');

const router = express.Router();

const MAX_VALUE_SMALL_INT = 32768;

/**
 * Handles /tentit
 */

router.get('/', verifyToken, async (req, res) => 
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
router.get('/:examId', verifyToken, async (req, res) => 
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
    if (examRow !== undefined) {
      res.status(200).send(examRow);
    }
    else {
      //No content
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
 * Adds a new exam
 */
router.post('/', verifyToken, verifyAdminRole, async (req, res) => 
{  
  const data = req.body;
	if (data === undefined || data.name === undefined || data.description === undefined || 
		!validateNumber(data.available_time, 0, MAX_VALUE_SMALL_INT) ||
		!validateDate(data.begin) || !validateDate(data.end))
	{
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  try {
    const examRow = await addExam(dbConnPool(), req.body);
    res.status(201).send(examRow);
  }
  catch (err) {
    res.status(500).send('Database query error: ' + err.message);
    console.log('Database query error:', err);
    return;
  }
});

router.put('/:examId', verifyToken, verifyAdminRole, async (req, res) =>
{
  const examIdParam = validateReqParamId(req.params.examId);
  if (examIdParam === undefined) {
    res.status(400).send('Invalid http request parameter');
    return;
  }
  const data = req.body;
  if (data === undefined || data.name === undefined || data.description === undefined || 
			!validateNumber(data.available_time, 0, MAX_VALUE_SMALL_INT) ||
			!validateDate(data.begin) || !validateDate(data.end))
	{
    res.status(400).send('Invalid http requets parameter');
    return;
  }
  try {
    const updatedExam = await updateExam(dbConnPool(), examIdParam, req.body);
    //Undefined result means that not found, postgres doesn't throw error
    if (updatedExam !== undefined) {
        res.status(200).send(updatedExam);
    }
    else {
      res.status(404).send({sender: 'application', message: 'Exam not found'});
    }
  }
  catch (err) {
      res.status(500).send('ERROR: ' + err.message);
      console.log('ERROR: ', err);
      return;
  }
})

module.exports = router;
