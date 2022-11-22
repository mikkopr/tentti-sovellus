
import { useEffect, useReducer } from "react";

import EditAnswer from "./EditAnswer";

import {fetchQuestionAndAnswers} from '../dataFunctions/examDataFunctions';
import {addAnswer} from '../dataFunctions/answerDataFunctions';
import { act } from "react-dom/test-utils";


function reducer(state, action)
{
	const stateCopy = {...state, answers: [...state.answers]};
	switch (action.type) {
		case 'DATA_RECEIVED':
			console.log('DATA_RECEIVED');
			stateCopy.text = action.payload.text;
			stateCopy.number = action.payload.number;
			stateCopy.points = action.payload.points;
			stateCopy.answers = action.payload.answers;
			stateCopy.initialized = true;
			return stateCopy;
		case 'ANSWER_ADDED':
			console.log('ANSWER_ADDED');
			stateCopy.answers.push(action.payload.answer);
			return stateCopy;
		default:
			throw Error('Unknown event: ' + action.type);
	}
}

const initialState = {
	examId: undefined,
	questionId: undefined,
	text: '',
	number: 0,
	points: 0,
	answers: [],
	initialized: false
}

const EditQuestion = (props) => 
{ 
	const [state, dispatch] = useReducer(reducer, {...initialState, examId: props.examId, questionId: props.questionId});

	useEffect( () =>
	{
		let fetchResult;
		const fetchData = async () => {
			try {
			 	fetchResult = await fetchQuestionAndAnswers(state.questionId);
			}
			catch (err) {
				props.dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
				return;
			}
			if (!fetchResult) {
				props.dispatch({type: 'FAILED_TO_FETCH_DATA'});
				return;
			}
			dispatch({type: 'DATA_RECEIVED', payload: fetchResult});
		}
		if (!state.initialized) {
			fetchData();
		}
	}, [state.initialized]);

	async function handleAddAnswerClicked()
	{
		try {
			const addedAnswer = await addAnswer(state.questionId);
			dispatch({type: 'ANSWER_ADDED', payload: {answer: addedAnswer} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_SAVE_DATA', payload: err});
			return;
		}
	}

	return (
    <div className="kysymys">
        <div>
            <input type='textbox' className="kysymys-teksti" value={state.text}
                onChange={event => dispatch(
                    {type: 'QUESTION_VALUE_CHANGED',
                    payload: {value: event.target.value}
                    }
                )}
            />
        </div>
        <div>
            {state.answers.map( (answer) => {
                return (
                    <EditAnswer
                        key={answer.answerId}
                        answer={answer}
												questionId={state.questionId}
                        dispatch={dispatch}
                    /> );
                })
            }
        </div>
        <div className="button-row">
            <input type='button' className='add-button' value='+'
                onClick={event => handleAddAnswerClicked()}
            />
        </div>
    </div>
    );
} 

export default EditQuestion;
