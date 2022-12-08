
import EditExam from './EditExam';
import * as examService from '../dataFunctions/examDataFunctions';

const ExamList = (props) =>
{
	async function handleAddExamClicked()
	{
		try {
			const addedExam = await examService.addExam();
			props.dispatch({type: 'EXAM_ADDED', payload: addedExam});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	async function handleRemoveExamClicked(examId)
	{
		try {
			await examService.removeExam(examId);
			props.dispatch({type: 'EXAM_REMOVED', payload: {examId: examId}});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	async function handleOpenExamClicked(examId)
	{
		try {
			const questionDataArray = await examService.fetchQuestionsForExam(examId);
			props.dispatch({type: 'ACTIVE_EXAM_CHANGED', 
				payload: {examId: examId, questionDataArray: questionDataArray} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
		}
	}

	/**
	 * Creates a new exam, that has the same questions as the given exam
	 */
	async function handleCloneExamClicked(examId)
	{
		//TODO
	}

	async function handleAssignToExamClicked(examId, userId)
	{
		try {
			let result = await examService.assignUserToExam(examId, userId);
			if (result.resultStatus === 'success') {
				props.dispatch({type: 'USER_ASSIGNED_TO_EXAM', payload: {examId: examId, userId: userId}});
			}
			else {
				//Currently everything else is error and catched
			}
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
		}
	}

	function handleBeginExamAssignmentClicked(examId)
	{
		//Root component handles data loading
		props.dispatch({type: 'EXAM_EVENT_BEGIN_REQUESTED', payload: {examId: examId}})
	}

	return (
		<div>
			<button type='button' onClick={(event) => handleAddExamClicked()}>Uusi tentti</button>
			<div>
				{props.exams.map( (item) => {
					return (
						<div key={item.id}>
							<EditExam exam={item} dispatch={props.dispatch}/>
							{props.admin && <button type='button' onClick={(event) => handleOpenExamClicked(item.id)}>Avaa</button>}
							{props.admin && <button type='button' onClick={(event) => handleCloneExamClicked(item.id)}>Kloonaa</button>}
							{props.admin && <button type='button' onClick={(event) => handleRemoveExamClicked(item.id)}>Poista</button>}
							{!props.admin && <>
								<button type='button' onClick={(event) => handleAssignToExamClicked(item.id, props.userId)}>Ilmoittaudu</button>
								<button type='button' onClick={(event) => handleBeginExamAssignmentClicked(item.id)}>Aloita</button></>
							}
						</div>
					)
					})}
			</div>
		</div>
	);
}

export default ExamList;
