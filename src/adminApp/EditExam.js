
import '../App.css';
import EditQuestion from './EditQuestion';
import {updateExam, addNewQuestionToExam, removeQuestionFromExam} from '../dataFunctions/examDataFunctions';

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

	async function handleExamNameChanged(event)
	{
		try {
			const modifiedExam = {...props.exam, name: event.target.value};
			await updateExam(modifiedExam);
			props.dispatch({type: 'EXAM_DATA_CHANGED', payload: modifiedExam});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	async function handleExamBeginChanged(event)
	{
		
	}

	async function handleExamBeginTimeChanged(event)
	{

	}

	async function handleExamEndChanged(event)
	{
		console.log(event.target.valueAsDate);
	}

	async function handleExamAvailableTimeChanged(event)
	{

	}

	return (
		<div className='exam'>
			<h3>{props.exam.name}</h3>
			<div className='background-color-aqua'>
				<label htmlFor='name'>Nimi:</label>
				<input type='text' id='name' value={props.exam.name}
						onChange={(event) => handleExamNameChanged(event)}/>
				<label htmlFor='begin'>Alkuaika:</label>
				<input type='text' id='beginDate' value={props.exam.begin ? props.exam.begin.split('T')[0] : ''}
						onChange={(event) => handleExamBeginChanged(event)}/>
				<input type='text' id='beginTime' value={props.exam.begin ? props.exam.begin.split('T')[1]?.slice(0, 5) : ''}
						onChange={(event) => handleExamBeginTimeChanged(event)}/>
				<label htmlFor='end'>Loppuaika:</label>
				<input type='date' id='end' value={props.exam.end ? props.exam.end : ''}
						onChange={(event) => handleExamEndChanged(event)}/>
				<label htmlFor='availableTime'>Tekoaika (min):</label>
				<input type='text' id='availableTime' value={props.exam.availableTime}
						onChange={(event) => handleExamAvailableTimeChanged(event)}/>
			</div>
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
