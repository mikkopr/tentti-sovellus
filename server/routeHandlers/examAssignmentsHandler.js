
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {assignUserToExam} = require('../examAssignmentFunctions');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /tenttisuoritukset
 */

/**
 * Returns the assingments of the user
 */
router.get('/kayttaja/:userId', async (req, res) => { 
});

/**
 * Returns the assigned users of the exam
 */
router.get('/tentti/:examId', async (req, res) =>
{
  res.status(200).send('NOT IMPLEMENTED');
});

/**
 * Assings the user to the exam.
 */
router.post('/kayttaja/:userId/tentti/:examId', async (req, res) =>
{
const userId = validateReqParamId(req.params.userId);
const examId = validateReqParamId(req.params.examId);
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
    if (err.code == 23503) {
      res.status(404).send('ERROR: User or exam does not exist');
      console.log('ERROR: DatabaseError: ', err.message);
    }
    else if (err.code == 23505) {
      res.status(409).send('User is already assigned to the exam');
      console.log('WARNING: Tried to insert a duplicate: ', err.message);
    }
    else {
      res.status(500).send('ERROR: Database is unable to fulfill the operation');
      console.log('ERROR: DatabaseError', err.message);
    }
  }
  else {
    res.status(500).send('ERROR: Server failed to process the operation');
    console.log('ERROR: ', err.message);
  }
}
});

/**
 * Updates the assingment of the user
 */
router.put('/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

/**
 * Deletes the assingment of the user
 */
router.put('/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

module.exports = router;