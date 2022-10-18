
import './AdminApp.css';

const EditAnswer = (props) => {
    return (
    <div>
        <input type='checkbox' 
            //value={props.answer.number}
            //checked={props.answer.isCorrect}
        />
        <input type='textbox' value={props.answer.answer}
            onChange={event => props.dispatch(
                {type:'ANSWER_VALUE_CHANGED',
                payload: {value: event.target.value,
                    questionIndex: props.questionIndex, answerIndex: props.answerIndex}
                }
            )}
        />
        
    </div>);
}

export default EditAnswer;
