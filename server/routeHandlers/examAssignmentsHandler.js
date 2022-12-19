

const express = require('express');
const { DatabaseError } = require('pg');

const {dbConnPool} = require('../db');
const {assignUserToExam, calculateExamResults} = require('../examAssignmentFunctions');
const {validateReqParamId, verifyToken, verifyAdminRole, userInRole} = require('../validateFunctions');
const {resultCodes} = require('../../src/resultCodes.js');
const roles = require('../roles');

const router = express.Router();

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
 * Response data is an array of assingments of the user. Empty array if no assignments found.
 * Without parameters includes only uncompleted and available currently or in the future.
 * 
 * Response: {resultStatus: , data: }
 * 
 * Query string parameters:
 * 	suoritetut=true: Includes only completed assignments
 */
router.get('/kayttaja/:userId', verifyToken, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
	if (userIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	const queryCompletedAssignments = req.query.suoritetut === 'true';
	try {
		//Admin role required to view other users' assignments
		if (userIdParam != req.decodedToken.userId && !(await userInRole(req.decodedToken, roles.roles().admin))) {
			res.status(403).send('Ei käyttöoikeutta');
			return;
		}
		let timestampResult = await dbConnPool().query("SELECT current_timestamp(0)");
		const timestamp = timestampResult.rows[0]?.current_timestamp;
		const currDate = new Date(timestamp);
		
		let values = [userIdParam];
		let text =
			`SELECT tentti_suoritus.tentti_id as exam_id, tentti_suoritus.kayttaja_id AS user_id, 
				tentti_suoritus.aloitusaika as begin, tentti_suoritus.vastaukset AS answers, tentti_suoritus. pisteet AS points, 
				tentti_suoritus.voimassa AS available, tentti_suoritus.suoritettu AS completed, 
				tentti_suoritus.tarkistettu AS checked, tentti_suoritus.hyvaksytty AS approved, tentti_suoritus.aloitettu as started
			FROM tentti_suoritus 
			INNER JOIN tentti ON tentti.id = tentti_suoritus.tentti_id
			WHERE tentti_suoritus.kayttaja_id = $1`

		if (queryCompletedAssignments) {
			text += ` AND tentti_suoritus.suoritettu = true`;
		}
		else {
			text += ` AND tentti_suoritus.suoritettu = false AND (tentti.alkuaika >= $2 OR tentti.alkuaika < $2 
				AND tentti.loppuaika > $2)`;
			values.push(currDate);
		}

		let result = await dbConnPool().query(text, values);
		res.status(200).send({resultStatus: 'success', data: result.rows});
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
			res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().dataNotFound, message: 'Exam assignment not found'});
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
 * Responses:
 *  status 200 body: {resultStatus: 'success'}
 * 		If the user was succesfully assigned or the user was already assigned
 * 	status 200 body: {resultStatus: 'failure', resultCode: }
 * 		If the assignment was not permitted
 * 
 *  status 401 Invalid token
 *  status 403 No permissions
 *  statsu 400 Invalid query
 *  status 500 Error
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
	if (rowCount > 0)
  	res.status(200).send({resultStatus: 'success'});
	else
		res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().assignmentToExamNotAllowed});
}
catch (err) {
  if (err instanceof DatabaseError) {
    if (err.code == 23503) {
      res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().dataNotFound});
      console.log('DATA_NOT_FOUND: Unable to assign user to exam because required data does not exists. Error message: ', err.message);
			return;
    }
    else if (err.code == 23505) {
      //User is already assigned to the exam
			res.status(200).send({resultStatus: 'success'});
			return;
    }
    else {
      res.status(500).send('ERROR: Database is unable to fulfill the operation');
      console.log('ERROR: DatabaseError: ', err.message);
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
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().examNotStarted});
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
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().dataNotFound, message: 'Exam assignment data not found'});
				return;
			}
			if (!assignmentData.available) {
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().examUnavailable , message: 'Exam is not available'});
				return;
			}
			//Exam already completed
			if (assignmentData.completed) {
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().examCompleted, message: "Exam is completed"});
				return;
			}
			const currentTimeMs = new Date(timestamp).getTime();
			const examBeginTimeMs = new Date(assignmentData.exam_begin).getTime();
			//Too early
			if (currentTimeMs < examBeginTimeMs) {
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().examUnavailable});
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
					res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().examAvailableTimeEnded, data: updateResult, message: 'No more available time'});
				else
					res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().dataNotFound, message: 'ERROR: Failed to update assignment'});
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
					
					//TODO Simple sollution for max points is to calculate them here and save in a tentti_suoritukset table
				}
				catch (err) {
					console.log('Failed to calculate exam results');
				}
			}
			let updateResult = await updateExamAssignment(userIdParam, examIdParam, updateData);
			if (updateResult)
				res.status(200).send({resultStatus: 'success', data: updateResult});
			else
				res.status(200).send({resultStatus: 'failure', resultCode: resultCodes().dataNotFound, message: 'ERROR: Failed to update assignment'});
		}
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to process the request');
		console.log('ERROR: ', err.message);
		return;
	}
});

/**
 * Deletes the assingment of the user.
 * 
 * Response:
 * 	If assignment deleted: {resultStatus: 'success'}
 *  If delete not allowed due to the state of the assignment data: {resultstatus: 'failure', resultCode: , message: }
 * 	Status code is 200
 * 
 * 	Otherwise responds using status codes: 400, 401, 500
 * 
 */
router.delete('/kayttaja/:userId/tentti/:examId', verifyToken, async (req, res) => 
{
	const userIdParam = validateReqParamId(req.params.userId);
	const examIdParam = validateReqParamId(req.params.examId);
	if (userIdParam === undefined || examIdParam === undefined) {
		res.status(400).send('Invalid http requets parameter');
		return;
	}
	let inAdminRole
	try {
		inAdminRole = await userInRole(req.decodedToken, roles.roles().admin);
	}
	catch (err) {
		res.status(500).send('ERROR: Server failed to verify role');
		console.log('ERROR: Server failed to verify role: ', err.message);
		return;
	}
	//Admin role required to delete other users' assignments
	if (userIdParam != req.decodedToken.userId && !inAdminRole) {
		res.status(403).send('No permissions');
		return;
	}
	try {
		//Admin is allowed to delete assignments uncoditionally
		if (inAdminRole) {
			const text = "DELETE FROM tentti_suoritus WHERE kayttaja_id=$1 AND tentti_id=$2";
			const values = [userIdParam, examIdParam];
			await dbConnPool().query(text, values);
			res.status(200).send({resultStatus:'success'});
		}
		else {
			//User can delete an assignment if it's not started yet and the current datetime < exam's begin datetime 			
			let text = 
				`SELECT tentti_suoritus.aloitettu AS assignment_started, tentti.alkuaika AS exam_begin
				FROM tentti_suoritus
				INNER JOIN tentti ON tentti.id = tentti_suoritus.tentti_id
				WHERE tentti_suoritus.kayttaja_id=$1 AND tentti_suoritus.tentti_id=$2 
				AND NOT tentti_suoritus.aloitettu AND current_timestamp(0) < tentti.alkuaika`;
			let values = [userIdParam, examIdParam];
			let result = await dbConnPool().query(text, values);
			if (result.rowCount === 0) {
				res.status(200).send({resultStatus:'failure', resultCode: resultCodes().notAllowedToDeleteAssignment});
				return;
			}
			text = `DELETE FROM tentti_suoritus WHERE kayttaja_id=$1 AND tentti_id=$2`;
			await dbConnPool().query(text, values);
			res.status(200).send({resultStatus:'success'});
		}
	}
	catch (err) {
		res.status(500).send('ERROR: ' + err.message);
    console.log('ERROR: ', err);
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

/*
...
"vastaukset": {
	"answers": [
		{"questionId": 15, "answerIds": [9,29]},
		{"questionId": 16, "answerIds": [11]} ]},
...
*/

module.exports = router;