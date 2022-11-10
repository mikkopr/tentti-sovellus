
const express = require('express');

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
router.put('/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

/**
 * Deletes the assingment of the user
 */
router.put('/kayttaja/:userId/tentti/:examId', async (req, res) => { 
});

module.exports = router;