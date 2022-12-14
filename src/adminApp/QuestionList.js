
import '../App.css';
import {addNewQuestionToExam, removeQuestionFromExam} from '../dataFunctions/examDataFunctions';
import EditQuestion from './EditQuestion';
import QuestionHeader from './QuestionHeader';

const QuestionList = (props) =>
{
	console.log('QuestionList');

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
			//Its ok to try to remove nonexisting question
			await removeQuestionFromExam(props.examId, questionId);
			props.dispatch({type: 'QUESTION_REMOVED_FROM_EXAM', payload: {examId: props.examId, questionId: questionId}});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	return (
		<>
		<div className='kysymys-lista'>
		{props.questionDataArray.map( (item) => {
			return (
				<div key={item.id}>
					<QuestionHeader examId={props.examId} questionId={item.id} number={item.number} points={item.points}
						allowEdit={true} dispatch={props.dispatch}/>
					<EditQuestion
						questionId={item.id}
						dispatch={props.dispatch}
					/>
					<button type='button' onClick={(event) => handleRemoveQuestionClicked(item.id)}>-</button>
				</div>
				)
			})
		}
		</div>
		<button type='button' onClick={event => handleAddQuestionClicked(props.examId)}>+</button>
		</>
		);	
}

export default QuestionList;
