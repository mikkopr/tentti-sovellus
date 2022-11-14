
import '../App.css';

const EditAnswer = (props) => {
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
    </div>);
}

export default EditAnswer;
