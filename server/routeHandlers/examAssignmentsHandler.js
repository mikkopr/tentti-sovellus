

const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {assignUserToExam, calculateExamResults} = require('../examAssignmentFunctions');
const {validateReqParamId, verifyToken, verifyAdminRole, userInRole} = require('../validateFunctions');
const roles = require('../roles');

const router = express.Router();

const ResultCodes = 
{
	dataNotFound: 1401,
	examUnavailable: 1601,
	examAvailableTimeEnded: 1602,
	examNotStarted: 1603,
	examCompleted: 1604,
	userNotAssignedToExam: 1605
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
	try {
		//Admin role required to view other users' assignments
		if (userIdParam != req.decodedToken.userId && !(await userInRole(req.decodedToken, roles.roles().admin))) {
			res.status(403).send('Ei käyttöoikeutta');
			return;
		}
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
 * Returns the assingment of the user for the exam
 */
 router.get('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) => 
 {
	const userIdParam = validateReqParamId(req.params.userId);
	const examIdParam = validateReqParamId(req.params.examId);
	if (userIdParam === undefined || examIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	try {
		//Admin role required to view the assignments of other users
		if (userIdParam != req.decodedToken.userId && !(await userInRole(req.decodedToken, roles.roles().admin))) {
			res.status(403).send('Ei käyttöoikeutta');
			return;
		}
		const result = await dbConnPool().query(
			`SELECT
				tentti_id AS exam_id, kayttaja_id AS user_id, aloitusaika as begin, vastaukset AS answers, pisteet AS points, 
				voimassa AS available, suoritettu AS completed, tarkistettu AS checked, hyvaksytty AS approved, aloitettu as started
				FROM tentti_suoritus WHERE kayttaja_id=$1 AND tentti_id=$2`, [userIdParam, examIdParam]);
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
 * Assingns the user to the exam.
 * 
 * If the user was succesfully assigned or the user was already assigned,
 * responds with status code 200 and body: {resultStatus: 'success'}
 */
router.post('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) =>
{
const userIdParam = validateReqParamId(req.params.userId);
const examIdParam = validateReqParamId(req.params.examId);
if (userIdParam === undefined || examIdParam === undefined) {
  res.status(400).send('Invalid http requets parameter');
  return;
}
try {
	//Admin role required to assign other users
	if (userIdParam != req.decodedToken.userId && !(await userInRole(req.decodedToken, roles.roles().admin))) {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
  const rowCount = await assignUserToExam(dbConnPool(), userIdParam, examIdParam);
  res.status(200).send({resultStatus: 'success'});
}
catch (err) {
  if (err instanceof DatabaseError) {
    if (err.code == 23503) {
      res.status(404).send('ERROR: User or exam does not exist');
      console.log('ERROR: DatabaseError: ', err.message);
			return;
    }
    else if (err.code == 23505) {
      //res.status(409).send('User is already assigned to the exam');
			res.status(200).send({resultStatus: 'success'});
      //console.log('WARNING: Tried to insert a duplicate: ', err.message);
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
	let inAdminRole
	try {
		inAdminRole = await userInRole(req.decodedToken, roles.roles().admin);
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to verify role');
		console.log('ERROR: Server failed to verify role: ', err.message);
		return;
	}
	//Admin role required to edit other users' assignments
	if (userIdParam != req.decodedToken.userId && !inAdminRole) {
		res.status(403).send('Ei käyttöoikeutta');
		return;
	}
	try {
		if (inAdminRole) {
			//TODO
			const result = await dbConnPool().query(
				"UPDATE tentti_suoritus SET hyvaksytty=$3 WHERE kayttaja_id=$1 AND tentti_id=$2 RETURNING *",
				[userIdParam, examIdParam, data.hyvaksytty]);
			res.status(200).send(result.rows[0]);
		}
		else {
			//aloitusaika as begin, vastaukset AS answers, pisteet AS points, 
			//voimassa AS available, suoritettu AS completed, hyvaksytty AS approved, aloitettu as started
			//Nothing to update if the user hasn't started the exam
			if (!data.started) {
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.examNotStarted});
				return;
			}
			//Query timestamp
			let result = await dbConnPool().query("SELECT current_timestamp(0)");
			const timestamp = result.rows[0]?.current_timestamp; //!!
			//Query data related to assignment
			let text = `SELECT 
				tentti_suoritus.voimassa AS available,
				tentti_suoritus.aloitettu AS started,
				tentti_suoritus.suoritettu AS completed,
				tentti_suoritus.tarkistettu AS checked,
				tentti_suoritus.aloitusaika AS assignment_begin,
				tentti_suoritus.vastaukset AS answers,
				tentti_suoritus.pisteet AS points,
				tentti.alkuaika AS exam_begin,
				tentti.loppuaika AS exam_end,
				tentti.tekoaika_mins AS available_time
				FROM tentti_suoritus INNER JOIN tentti ON tentti_suoritus.tentti_id=tentti.id WHERE tentti_suoritus.tentti_id=$1`;
			let values = [examIdParam];
			result = await dbConnPool().query(text, values);
			const assignmentData = result.rows[0];
			if (!assignmentData) {
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.dataNotFound, message: 'Exam assignment data not found'});
				return;
			}
			if (!assignmentData.available) {
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.examUnavailable , message: 'Exam is not available'});
				return;
			}
			//Exam already completed
			if (assignmentData.completed) {
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.examCompleted, message: "Exam is completed"});
				return;
			}
			const currentTimeMs = new Date(timestamp).getTime();
			const examBeginTimeMs = new Date(assignmentData.exam_begin).getTime();
			//Too early
			if (currentTimeMs < examBeginTimeMs) {
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.examUnavailable});
				return;
			}
			//From now on database is updated
			const updateData = {...assignmentData};			
			const startTimeMs = assignmentData.started ? new Date(assignmentData.assignment_begin).getTime() : currentTimeMs;
			const examEndTimeMs = new Date(assignmentData.exam_end).getTime(); //No answers accepted after this time
			const examAvailableTimeMs = assignmentData.available_time * 60 * 1000;
			//If time is out, mark the assignment completed but don't update answers
			if (currentTimeMs > examEndTimeMs || currentTimeMs > startTimeMs + examAvailableTimeMs) {
				updateData.started = true;
				updateData.completed = true;
				let updateResult = await updateExamAssignment(userIdParam, examIdParam, updateData);
				if (updateResult)
					res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.examAvailableTimeEnded, data: updateResult, message: 'No more available time'});
				else
					res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.dataNotFound, message: 'ERROR: Failed to update assignment'});
				return;
			}
			//If got here the exam is ongoing and given answers are updated
			if (!assignmentData.started) {
				updateData.started = true;
				updateData.assignment_begin = new Date(timestamp);
			}
			updateData.answers = data.answers;
			//User finished the exam, calculate the results
			if (data.completed) {
				updateData.completed = true;
				try {
					//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! why error in calculate function isn't catched
					//Answer: because await was missing
					updateData.points = await calculateExamResults(dbConnPool(), examIdParam, data.answers.answers);
					updateData.checked = true;
				}
				catch (err) {
					console.log('Failed to calculate exam results');
				}
			}
			let updateResult = await updateExamAssignment(userIdParam, examIdParam, updateData);
			if (updateResult)
				res.status(200).send({resultStatus: 'success', data: updateResult});
			else
				res.status(200).send({resultStatus: 'failure', resultCode: ResultCodes.dataNotFound, message: 'ERROR: Failed to update assignment'});
		}
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to process the request');
		console.log('ERROR: ', err.message);
		return;
	}
});

const updateExamAssignment = async (userId, examId, data) => 
{
	const text = `UPDATE tentti_suoritus 
		SET aloitettu=$3,suoritettu=$4,tarkistettu=$5,aloitusaika=$6,vastaukset=$7,pisteet=$8
		WHERE kayttaja_id=$1 AND tentti_id=$2
		RETURNING tentti_id AS exam_id, kayttaja_id AS user_id, aloitusaika as begin, vastaukset AS answers, pisteet AS points, 
		voimassa AS available, suoritettu AS completed, tarkistettu AS checked, hyvaksytty AS approved, aloitettu as started`;
	const values = [userId, examId, data.started, data.completed, data.checked, data.assignment_begin, data.answers, data.points];
	const result = await dbConnPool().query(text, values);
	return result.rows[0];
}

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