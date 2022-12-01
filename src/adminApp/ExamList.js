
import EditExam from './EditExam';
import { addExam, removeExam, fetchQuestionsForExam } from '../dataFunctions/examDataFunctions';

const ExamList = (props) =>
{
	async function handleAddExamClicked()
	{
		try {
			const addedExam = await addExam();
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
			await removeExam(examId);
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
			const questionDataArray = await fetchQuestionsForExam(examId);
			props.dispatch({type: 'ACTIVE_EXAM_CHANGED', 
				payload: {examId: examId, questionDataArray: questionDataArray} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
		}
	}

	return (
		<div>
			<button type='button' onClick={(event) => handleAddExamClicked()}>Uusi tentti</button>
			<div>
				{props.exams.map( (item) => {
					return (
						<div key={item.id}>
							<EditExam exam={item} dispatch={props.dispatch}/>
							<button type='button' onClick={(event) => handleOpenExamClicked(item.id)}>Avaa</button>
							<button type='button' onClick={(event) => handleRemoveExamClicked(item.id)}>Poista</button>
						</div>
					)
					})}
			</div>
		</div>
	);
}

export default ExamList;
