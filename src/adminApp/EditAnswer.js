
import '../App.css';
import  {deleteAnswer} from '../dataFunctions/answerDataFunctions'

const EditAnswer = (props) => 
{
  async function handleDeleteAnswerClicked(answer)
	{
		try {
			await deleteAnswer(answer.id);
			props.dispatch({type: 'ANSWER_DELETED', payload: {answerId: answer.answerId, questionId: props.questionId} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_SAVE_DATA', payload: err});
			return;
		}
	}  
	
	return (
    <div className='edit-answer'>
        <div>
            <input type='checkbox' 
                checked={props.answer.correct}
                onChange={event => 
                    props.dispatch(
                        {type: 'ANSWER_CHECKED_STATE_CHANGED',
                        payload: {value: event.target.checked, 
                            questionId: props.questionId,
                            answerId: props.answer.answerId}
                        }
                    )
                }
            />
        </div>
        <div>
            <input type='textbox' value={props.answer.text}
                onChange={event => props.dispatch(
                    {type:'ANSWER_VALUE_CHANGED',
                    payload: {value: event.target.value,
											questionId: props.questionId, answerId: props.answer.answerId}
                    }
                )}
            />
        </div>
				<div>
					<input type='button' value='-' onClick={(event) => handleDeleteAnswerClicked(props.answer)} />
				</div>
    </div>);
}

export default EditAnswer;
