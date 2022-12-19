
const ResultCodes = 
{
	dataNotFound: 1401,
	examUnavailable: 1601,
	examAvailableTimeEnded: 1602,
	examNotStarted: 1603,
	examCompleted: 1604,
	userNotAssignedToExam: 1605,
	assignmentToExamNotAllowed: 1606,
	notAllowedToDeleteAssignment: 1607
}

function resultCodes()
{
	return ResultCodes;
}

module.exports = {resultCodes};
