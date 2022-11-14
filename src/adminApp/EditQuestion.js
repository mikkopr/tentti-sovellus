
import EditAnswer from "./EditAnswer";

const EditQuestion = (props) => {
    return (
    <div className="kysymys">
        <div>
            <input type='textbox' className="kysymys-teksti" value={props.question.teksti}
                onChange={event => props.dispatch(
                    {type: 'QUESTION_VALUE_CHANGED',
                    payload: {value: event.target.value, questionId: props.question.id}
                    }
                )}
            />
        </div>
        <div>
            {props.question.answers.map( (answer) => {
                return (
                    <EditAnswer
                        key={answer.id}
                        answer={answer}
                        dispatch={props.dispatch}
                    /> );
                })
            }
        </div>
        <div className="button-row">
            <input type='button' className='add-button' value='+'
                onClick={event => props.dispatch( 
                    {type: 'ADD_ANSWER_CLICKED',
                    payload: {questionId: props.question.id}} 
                )}
            />
        </div>
    </div>
    );
} 

export default EditQuestion;
