
const {fetchExamIncludingAnswers} = require('./examFunctions');

/**
 * Insert a new row to tentti_suoritus table.
 * Returns one if new row was inserted or throws an error.
 */
const assignUserToExam = async (pool, userId, examId) =>
{
  const text = "INSERT INTO tentti_suoritus (kayttaja_id, tentti_id) VALUES ($1, $2)";
  const values = [userId, examId];
  const result = await pool.query(text, values);
  return result.rowCount;
}

//TODO return incorrect points
const calculateExamResults = async (pool, examId, givenAnswersArr) =>
{
	let exam
	try {
		exam = await fetchExamIncludingAnswers(pool, examId, true);
	}
	catch (err) {
		throw err;
	}
	if (!exam)
		throw Error("Exam not found.");
	let points = 0;
	exam.questions.forEach((question) => {
			let questIndex = givenAnswersArr.findIndex(item => item.questionId === question.id);
			//If user has answered, check
			if (questIndex !== -1)
				points += calculatePointsForAnswer(givenAnswersArr[questIndex].answerIds, question);
		});
	return points;
}

/**
 * Returns points for the question when the answer option ids in givenAnswerIdsArr array are chosen.
 */
const calculatePointsForAnswer = (givenAnswerIdsArr, question) =>
{
	const numCorrectOptions = question.answers?.reduce((acc, curr) => curr.answer_correct===true ? acc + 1 : acc, 0);
	const pointsPerCorrect = (numCorrectOptions > 0) ? Math.floor(question.points / numCorrectOptions) : question.points;
	const result = givenAnswerIdsArr.reduce((points, ansId) => {
			if (question.answers.find(answer => answer.id === ansId && answer.answer_correct === true))
				return points + pointsPerCorrect;
			else
				return points - pointsPerCorrect;
		}, 0);
	return result;
}

module.exports = {assignUserToExam, calculateExamResults};
