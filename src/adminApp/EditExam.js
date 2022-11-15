
import '../App.css';
import EditQuestion from './EditQuestion';
import {addNewQuestionToExam} from '../dataFunctions/examDataFunctions';

const EditExam = (props) => 
{
	async function handleAddQuestionClicked(examId)
	{
		let addedQuestion = undefined;
		try {
			addedQuestion = await addNewQuestionToExam(examId);
			props.dispatch({type: 'NEW_QUESTION_ADDED_TO_EXAM', payload: {examId: examId, question: addedQuestion} });
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
				{props.exam.questions.map( (question) => {
					return (<EditQuestion 
						key={question.id}
						question={question}
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
