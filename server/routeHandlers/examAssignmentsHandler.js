
const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {assignUserToExam} = require('../examAssignmentFunctions');
const {validateReqParamId, verifyToken, verifyAdminRole} = require('../validateFunctions');

const router = express.Router();

const ResultCodes = 
{
	dataNotFound: 1001
}

/**
 * Handles /tenttisuoritukset
 */

 router.get('/', verifyToken, verifyAdminRole, async (req, res) => 
 {
	 try {
		 const result = await dbConnPool().query("SELECT * FROM tentti_suoritus ORDER BY tentti_id ASC");
		 res.status(200).send(result.rows);
	 }
	 catch (err) {
		 res.status(500).send('ERROR: Server failed to process the request');
		 console.log('ERROR: ', err.message);
		 return;
	 }
 });

/**
 * Returns the assingments of the user
 */
router.get('/kayttaja/:userId', verifyToken, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
	if (userIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	//Admin role required to view other users' assignments
	if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	try {
		const result = await dbConnPool().query(
			"SELECT * FROM tentti_suoritus WHERE kayttaja_id=$1", [userIdParam]);
		res.status(200).send(result.rows[0]);
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to process the request');
    console.log('ERROR: ', err.message);
		return;
	}
});

/**
 * Returns the assingment of the user
 */
 router.get('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) => 
 {
	const userIdParam = validateReqParamId(req.params.userId);
	const examIdParam = validateReqParamId(req.params.examId);
	if (userIdParam === undefined || examIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	//Admin role required to view the assignments of other users
	if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	try {
		const result = await dbConnPool().query(
			"SELECT * FROM tentti_suoritus WHERE kayttaja_id=$1 AND tentti_id=$2", [userIdParam, examIdParam]);
		if (result.rows[0])
		 	res.status(200).send({resultStatus: 'success', data: result.rows[0]});
		else
			res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.dataNotFound, message: 'Exam assignment not found'});
	 }
	 catch (err) {
		 res.status(500).send('ERROR: Server failed to process the request');
		 console.log('ERROR: ', err.message);
		 return;
	 }
 });

/**
 * Returns the assigned users of the exam
 */
router.get('/tentti/:examId', verifyToken, verifyAdminRole, async (req, res) =>
{
  res.status(500).send('NOT IMPLEMENTED');
});

/**
 * Assings the user to the exam.
 */
router.post('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) =>
{
const userIdParam = validateReqParamId(req.params.userId);
const examIdParam = validateReqParamId(req.params.examId);
if (userIdParam === undefined || examIdParam === undefined) {
  res.status(400).send('Invalid http requets parameter');
  return;
}
//Admin role required to assign other users
if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
	res.status(403).send('Ei käyttöoikeutta');
	return;
}
try {
  const assingment = await assignUserToExam(dbConnPool(), userIdParam, examIdParam);
  res.status(200).send(assingment);
}
catch (err) {
  if (err instanceof DatabaseError) {
    if (err.code == 23503) {
      res.status(404).send('ERROR: User or exam does not exist');
      console.log('ERROR: DatabaseError: ', err.message);
			return;
    }
    else if (err.code == 23505) {
      res.status(409).send('User is already assigned to the exam');
      console.log('WARNING: Tried to insert a duplicate: ', err.message);
			return;
    }
    else {
      res.status(500).send('ERROR: Database is unable to fulfill the operation');
      console.log('ERROR: DatabaseError', err.message);
			return;
    }
  }
  else {
    res.status(500).send('ERROR: Server failed to process the operation');
    console.log('ERROR: ', err.message);
		return;
  }
}
});

/**
 * Updates the assingment of the user
 */
router.put('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
	const examIdParam = validateReqParamId(req.params.examId);
	if (userIdParam === undefined || examIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	const data = req.body;
  if (data == undefined || data.suoritettu === undefined || data.hyvaksytty === undefined || 
      data.vastaukset === undefined) {
    res.status(400).send('Invalid data in http request body');
  }
	//Admin role required to edit other users' assignments
	if (userIdParam != req.decodedToken.userId && req.decodedToken.role != 'admin') {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	//TODO
	try {
		if (req.decodedToken.role == 'admin') {
			const result = await dbConnPool().query(
				"UPDATE tentti_suoritus SET hyvaksytty=$3 WHERE kayttaja_id=$1 AND tentti_id=$2 RETURNING *",
				[userIdParam, examIdParam, data.hyvaksytty]);
			res.status(200).send(result.rows[0]);
		}
		else {
			const result = await dbConnPool().query(
				"UPDATE tentti_suoritus SET vastaukset=$3 WHERE kayttaja_id=$1 AND tentti_id=$2 RETURNING *",
				[userIdParam, examIdParam, data.vastaukset]);
			res.status(200).send(result.rows[0]);
		}
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to process the request');
		console.log('ERROR: ', err.message);
		return;
	}
});

/**
 * Deletes the assingment of the user
 */
router.delete('/kayttaja/:userId/tentti/:examId', verifyToken, verifyAdminRole, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
	const examIdParam = validateReqParamId(req.params.examId);
	if (userIdParam === undefined || examIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	try {
		const text = "DELETE FROM tentti_suoritus WHERE kayttaja_id=$1 AND tentti_id=$2";
    const values = [userIdParam, examIdParam];
    await dbConnPool().query(text, values);
		res.status(204).end();
	}
	catch (err) {
		res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
    return;
	}
});

/*
...
"vastaukset": {
	"answers": [
		{"questionId": 15, "answerIds": [9,29]},
		{"questionId": 16, "answerIds": [11]} ]},
...
*/

module.exports = router;