
import '../App.css';
import  {deleteAnswer, updateAnswer} from '../dataFunctions/answerDataFunctions'

const EditAnswer = (props) => 
{
	console.log("EditAnswer");

	async function handleAnswerTextBlur(value)
	{
		/*try {
			//TODO Is ok to use props for other values?
			const result = await updateAnswer(props.answer.id, value, props.answer.correct);
			props.dispatch( {type: 'ANSWER_CHANGED', payload: {answerId: result.id, text: result.text, correct: result.correct}} );
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_ANSWER', payload: err});
			return;
		}*/
	}
	
	async function handleAnswerTextChanged(value)
	{
		try {
			//TODO Is ok to use props for other values?
			const result = await updateAnswer(props.answer.id, value, props.answer.correct);
			props.dispatch( {type: 'ANSWER_CHANGED', payload: {answerId: result.id, text: result.text, correct: result.correct}} );
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_ANSWER', payload: err});
			return;
		}
	}

	async function handleAnswerCheckedStateChanged(value)
	{
		try {
			//TODO Is ok to use props for other values?
			const result = await updateAnswer(props.answer.id, props.answer.text, value);
			props.dispatch( {type: 'ANSWER_CHANGED', payload: {answerId: result.id, text: result.text, correct: result.correct}} );
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_ANSWER', payload: err});
			return;
		}
	}

  async function handleDeleteAnswerClicked(answer)
	{
		try {
			await deleteAnswer(answer.id);
			props.dispatch( {type: 'ANSWER_DELETED', payload: {answerId: answer.id}} );
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_DELETE_ANSWER', payload: err});
			return;
		}
	}  
	//Warning: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. 
	//If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`

	return (
    <div className='edit-answer'>
        <div>
            <input type='checkbox' 
                checked={props.answer.correct}
                onChange={(event) => handleAnswerCheckedStateChanged(event.target.checked)}
            />
        </div>
        <div>
            <input type='textbox' value={props.answer.text}
							onChange={(event) => handleAnswerTextChanged(event.target.value)}
							onBlur={(event) => handleAnswerTextBlur(event.target.value)}
            />
        </div>
				<div>
					<input type='button' value='-' onClick={(event) => handleDeleteAnswerClicked(props.answer)} />
				</div>
    </div>);
}

export default EditAnswer;
