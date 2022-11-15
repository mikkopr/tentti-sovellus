
import EditAnswer from "./EditAnswer";

import  {addAnswer} from '../dataFunctions/answerDataFunctions'

const EditQuestion = (props) => {
  
	async function handleAddAnswerClicked(questionId)
	{
		try {
			const addedAnswer = await addAnswer(questionId);
			props.dispatch({type: 'ANSWER_ADDED', payload: {questionId: questionId, answer: addedAnswer} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_SAVE_DATA', payload: err});
			return;
		}
	}

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
                onClick={event => handleAddAnswerClicked(props.question.id)}
            />
        </div>
    </div>
    );
} 

export default EditQuestion;
