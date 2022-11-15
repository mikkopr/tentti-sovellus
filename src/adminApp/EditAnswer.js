
import '../App.css';
import  {deleteAnswer} from '../dataFunctions/answerDataFunctions'

const EditAnswer = (props) => 
{
  async function handleDeleteAnswerClicked(answer)
	{
		try {
			await deleteAnswer(answer.id);
			props.dispatch({type: 'ANSWER_DELETED', payload: {answerId: answer.id, questionId: answer.kysymys_id} });
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
                checked={props.answer.oikein}
                onChange={event => 
                    props.dispatch(
                        {type: 'ANSWER_CHECKED_STATE_CHANGED',
                        payload: {value: event.target.checked, 
                            questionId: props.answer.kysymys_id,
                            answerId: props.answer.id}
                        }
                    )
                }
            />
        </div>
        <div>
            <input type='textbox' value={props.answer.teksti}
                onChange={event => props.dispatch(
                    {type:'ANSWER_VALUE_CHANGED',
                    payload: {value: event.target.value,
											questionId: props.answer.kysymys_id, answerId: props.answer.id}
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
