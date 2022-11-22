
import '../App.css';
import EditQuestion from './EditQuestion';
import {addNewQuestionToExam} from '../dataFunctions/examDataFunctions';

const EditExam = (props) => 
{
	async function handleAddQuestionClicked(examId)
	{
		let addedQuestionData = undefined;
		try {
			addedQuestionData = await addNewQuestionToExam(examId);
			props.dispatch({type: 'NEW_QUESTION_ADDED_TO_EXAM', 
				payload: {examId: examId, questionId: addedQuestionData.question.id, number: addedQuestionData.number, points: addedQuestionData.points} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_SAVE_DATA', payload: err});
			return;
		}
	}

	return (
		<div className='exam'>
			<h3>{props.exam.nimi}</h3>
			<div className='kysymys-lista'>
				{props.exam.questionList.map( (item) => {
					return (<EditQuestion
						key={item.questionId}
						questionId={item.questionId}
						dispatch={props.dispatch}
						/> )
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
