
import EditExam from './EditExam';
import * as examService from '../dataFunctions/examDataFunctions';

/**
 * props: {exams, examAssignments, admin, userId dispatch, handleShowExamListClicked}
 * 
 * TODO use dispatch instead of handleShowExamListClicked
 */
const ExamList = (props) =>
{
	function handleShowOngoingClicked()
	{
		props.dispatch({type: 'EXAM_LIST_SHOW_ONGOING'});
	}

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
				//TODO dispatch({type: 'OPERATION_NOT_PERMITTED', payload: {resultCode: result.resultCode}});
				//Currently no failures in result.resultStatus
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

	function isUserAssignedToExam(userId, examId)
	{
		return props.examAssignments.find( item => item.user_id === userId && item.exam_id === examId );
	}

	return (
		<div>
			<div className='toolbar'>
				<button type='button' onClick={() => props.dispatch({type: 'EXAM_LIST_SHOW_ONGOING'})}>Avoimet</button>
				<button type='button' onClick={() => props.dispatch({type: 'EXAM_LIST_SHOW_INCOMING'})}>Tulevat</button>
				<button type='button' onClick={() => props.dispatch({type: 'EXAM_LIST_SHOW_PAST'})}>Menneet</button>
				<button type='button' onClick={() => props.dispatch({type: 'EXAM_LIST_SHOW_ALL'})}>Kaikki</button>
				{props.admin && <button type='button' onClick={(event) => handleAddExamClicked()}>Uusi tentti</button>}
			</div>
			<div>
				{props.exams.map( (item) => {
					return (
						<div key={item.id}>
							<EditExam exam={item} dispatch={props.dispatch}/>
							
							{props.admin && <button type='button' onClick={(event) => handleOpenExamClicked(item.id)}>Avaa</button>}
							{props.admin && <button type='button' onClick={(event) => handleCloneExamClicked(item.id)}>Kloonaa</button>}
							{props.admin && <button type='button' onClick={(event) => handleRemoveExamClicked(item.id)}>Poista</button>}
							
							{!props.admin && !isUserAssignedToExam(props.userId, item.id) && 
								<button type='button' onClick={(event) => handleAssignToExamClicked(item.id, props.userId)}>Ilmoittaudu</button>}
						
							{!props.admin && isUserAssignedToExam(props.userId, item.id) && 
								<button type='button' onClick={(event) => handleBeginExamAssignmentClicked(item.id)}>Aloita</button>}
						</div>
					)
					})}
			</div>
		</div>
	);
}

export default ExamList;

/*function examShouldBeVisible(examId)
	{
		if (props.showOngoing) {
			const exam = props.exams.find(item => item.id === examId);
			if (!exam || !exam.begin || !exam.end) {
				return false;
			}
			const currTimeMs = new Date().getTime();
			const examBeginTimeMs = new Date(exam.begin).getTime();
			const examEndTimeMs = new Date(exam.end).getTime();
			return currTimeMs >= examBeginTimeMs && currTimeMs <= examEndTimeMs;
		}
	}*/
