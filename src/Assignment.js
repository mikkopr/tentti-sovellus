
import * as examService from './dataFunctions/examDataFunctions'
import * as dateUtils from './utils/dateUtils'

const Assignment = ( {assignment, exam, showCompleted, dispatch} ) =>
{
	async function handleCancelAssignmentClicked()
	{
		try {
			let result = await examService.deleteExamAssignment(assignment);
			if (result.resultStatus === 'success') {
				dispatch({type: 'ASSIGNMENT_CANCELED', payload: {assignment: assignment}});
			}
			else {
				dispatch({type: 'OPERATION_NOT_PERMITTED', payload: {resultCode: result.resultCode}});
			}
		}
		catch (err) {
			dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
		}
	}

	return (
		<>
			<h4>{exam.name}</h4>
			
			{showCompleted && !assignment.checked && <p>Tenttiä ei ole tarkistettu!</p>}
			{showCompleted && assignment.checked && <p>Pisteet: {assignment.points} / {assignment.max_points}</p>}
			{showCompleted && assignment.checked && <p>Suoritettu: {dateUtils.dateStringFromIsoString(assignment.begin)}</p>}
			{showCompleted && assignment.checked && <p>Hyväksytty: {assignment.approved ? 'Kyllä' : 'Ei'}</p>}

			{!showCompleted && <p>Alkaa: {dateUtils.dateStringFromIsoString(exam.begin)} klo {dateUtils.timeStringFromIsoString(exam.begin)}</p>}
			{!showCompleted && <p>Päättyy: {dateUtils.dateStringFromIsoString(exam.end)} klo {dateUtils.timeStringFromIsoString(exam.end)}</p>}
			{!showCompleted && <p>Tekoaikaa: {exam.available_time} min</p>}
			{!showCompleted && !assignment.started &&
				<p>
					<button type='button' onClick={(event) => handleCancelAssignmentClicked()}>Peru Ilmoittautuminen</button>
				</p>}


		</>
	);
}

export default Assignment;

//{exam.name} Alku: {exam.begin ? new Date(exam.begin) : ''} Loppu: {exam.end ? new Date(exam.end) : ''}