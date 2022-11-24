
import '../App.css';
import EditQuestion from './EditQuestion';
import {addNewQuestionToExam, removeQuestionFromExam} from '../dataFunctions/examDataFunctions';

const EditExam = (props) => 
{
	console.log("EditExam");

	async function handleAddQuestionClicked(examId)
	{
		let addedQuestionData = undefined;
		try {
			addedQuestionData = await addNewQuestionToExam(examId);
			props.dispatch({type: 'NEW_QUESTION_ADDED_TO_EXAM', 
				payload: {examId: examId, questionData: addedQuestionData} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	async function handleRemoveQuestionClicked(questionId)
	{
		try {
			//Its ok to try to remove nonexixting question
			await removeQuestionFromExam(props.exam.id, questionId);
			props.dispatch({type: 'QUESTION_REMOVED_FROM_EXAM', payload: {examId: props.exam.id, questionId: questionId}});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	return (
		<div className='exam'>
			<h3>{props.exam.name}</h3>
			<div className='kysymys-lista'>
				{props.exam.questionDataArray.map( (item) => {
					return (
						<div key={item.id}>
							<EditQuestion
								questionId={item.id}
								dispatch={props.dispatch}
							/>
							<input type='button' value='-'
								onClick={(event) => handleRemoveQuestionClicked(item.id)}
							/>
						</div>
						)
					})
				}
			</div>
			<div>
				<input type='button' value='+'
					onClick={event => handleAddQuestionClicked(props.exam.id)}
				/>
			</div>
		</div>
	);
};

export default EditExam;
