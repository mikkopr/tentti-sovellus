
import { updateQuestionDataForExam } from '../dataFunctions/examDataFunctions.js';
import {validateNumber} from '../utils//validators.js';

const MAX_QUESTION_NUMBER = 10000;

const QuestionHeader = (props) => 
{
	async function handleQuestionNumberChanged(value)
	{
		if (value === '')
			value = '0';

		if (validateNumber(value, 0, MAX_QUESTION_NUMBER)) {
			try {
				await updateQuestionDataForExam(props.examId, props.questionId, value, props.points);
				props.dispatch({type: 'QUESTION_NUMBER_CHANGED', payload: {questionId: props.questionId, number: value}});
			}
			catch (err) {
				props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
				return;
			}
		}
	}

	async function handleQuestionPointsChanged(value)
	{
		if (value === '')
			value = '0';

		if (validateNumber(value, 0, MAX_QUESTION_NUMBER)) {
			try {
				await updateQuestionDataForExam(props.examId, props.questionId, props.number, value);
				props.dispatch({type: 'QUESTION_POINTS_CHANGED', payload: {questionId: props.questionId, points: value}});
			}
			catch (err) {
				props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
				return;
			}
		}
	}

	return (
		<div>
			{props.allowEdit ? 
				<input type='text' value={props.number} onChange={(event) =>  handleQuestionNumberChanged(event.target.value)}/> : props.number
			}
			Pisteet:
			{props.allowEdit ?
				<input type='text' value={props.points} onChange={(event) =>  handleQuestionPointsChanged(event.target.value)}/> : props.points
			}
		</div>
	);
}

export default QuestionHeader;
