
import './AdminApp.css';

const EditAnswer = (props) => {
    return (
    <div>
        <div>
            <input type='checkbox' 
                //value={props.answer.number}
                checked={props.answer.isCorrect}
                onChange={event => 
                    props.dispatch(
                        {type: 'ANSWER_CHECKED_STATE_CHANGED',
                        payload: {value: event.target.checked, 
                            questionIndex: props.questionIndex,
                            answerIndex: props.answerIndex}
                        }
                    )
                }
            />
        </div>
        <div>
            <input type='textbox' value={props.answer.answer}
                onChange={event => props.dispatch(
                    {type:'ANSWER_VALUE_CHANGED',
                    payload: {value: event.target.value,
                        questionIndex: props.questionIndex, answerIndex: props.answerIndex}
                    }
                )}
            />
        </div>
    </div>);
}

export default EditAnswer;
