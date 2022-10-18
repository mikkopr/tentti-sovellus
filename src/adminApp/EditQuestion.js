
import EditAnswer from "./EditAnswer";

const EditQuestion = (props) => {
    return (
    <div className="kysymys">
        <div>
            <input type='textbox' className="kysymys-teksti" value={props.question.question}
                onChange={event => props.dispatch(
                    {type: 'QUESTION_VALUE_CHANGED',
                    payload: {value: event.target.value, questionIndex: props.questionIndex}
                    }
                )}
            />
        </div>
        <div>
            {props.question.answers.map( (answer, index) => {
                return (
                    <EditAnswer
                        key={index}
                        answer={answer}
                        answerIndex={index}
                        questionIndex={props.questionIndex}
                        dispatch={props.dispatch}
                    /> );
                })
            }
        </div>
        <div>
            <input type='button' value='+'
                onClick={event => props.dispatch( 
                    {type: 'ADD_ANSWER_CLICKED',
                    payload: {questionIndex: props.questionIndex, answerIndex: props.answerIndex}} 
                )}
            />
        </div>
    </div>
    );
} 

export default EditQuestion;
