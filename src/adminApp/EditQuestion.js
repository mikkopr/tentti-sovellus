
import { useEffect, useReducer } from "react";

import EditAnswer from "./EditAnswer";

import {fetchQuestionAndAnswers, updateQuestion } from '../dataFunctions/examDataFunctions';
import {addAnswer} from '../dataFunctions/answerDataFunctions';


function reducer(state, action)
{
	const stateCopy = {...state};
	switch (action.type) {
		case 'DATA_RECEIVED':
			console.log('EditQuestion DATA_RECEIVED');
			stateCopy.text = action.payload.text;
			stateCopy.number = action.payload.number;
			stateCopy.points = action.payload.points;
			stateCopy.answers = action.payload.answers;
			return stateCopy;
		case 'QUESTION_TEXT_CHANGED':
			console.log('EditQuestion QUESTION_TEXT_CHANGED');
			stateCopy.text = action.payload.text;
			return stateCopy;
		case 'ANSWER_ADDED':
			console.log('EditQuestion ANSWER_ADDED');
			stateCopy.answers = [...stateCopy.answers];
			stateCopy.answers.push(action.payload.answer);
			return stateCopy;
		case 'ANSWER_DELETED':
		{
			console.log('EditQuestion ANSWER_DELETED');
			const answerIndex = stateCopy.answers.findIndex( (item) => item.id == action.payload.answerId );
			stateCopy.answers = stateCopy.answers.slice(0, answerIndex).concat(stateCopy.answers.slice(answerIndex + 1, stateCopy.answers.length));
			return stateCopy;
		}
		case 'ANSWER_CHANGED':
		{
			console.log('EditQuestion ANSWER_CHANGED');
			stateCopy.answers = [...stateCopy.answers];
			const answerIndex = stateCopy.answers.findIndex( (item) => item.id == action.payload.answerId );
			stateCopy.answers[answerIndex] = {...stateCopy.answers[answerIndex], text: action.payload.text, correct: action.payload.correct};
			return stateCopy;
		}
		case 'FAILED_TO_UPDATE_ANSWER':
			console.log('EditQuestion FAILED_TO_UPDATE_ANSWER');
			return stateCopy;
		case 'FAILED_TO_DELETE_ANSWER':
			console.log('EditQuestion FAILED_TO_DELETE_ANSWER');
			return stateCopy;
		//default:
			//throw Error('Unknown event: ' + action.type);
	}
}

const initialState = {
	examId: undefined,
	questionId: undefined,
	text: '',
	number: 0,
	points: 0,
	answers: [],
}

const EditQuestion = (props) => 
{ 
	console.log("EditQuestion");

	const [state, dispatch] = useReducer(reducer, {...initialState, examId: props.examId, questionId: props.questionId});

	useEffect( () =>
	{
		console.log('EditQuestion.useEffect(...)')
		const fetchData = async () => {
			let fetchResult;
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
		fetchData();
	}, []);

	async function handleQuestionTextChanged(value)
	{
		try {
			const updatedQuestion = await updateQuestion(state.questionId, value);
			dispatch({type: 'QUESTION_TEXT_CHANGED', payload: {text: updatedQuestion.text} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_QUESTION', payload: err});
			return;
		}
	}

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

	async function handleQuestionBlur(event)
	{
		console.log('handlequestionBlur() event.target.value: ', event.target.value);
	}

	return (
    <div className="kysymys">
        <div>
            <input type='textbox' className="kysymys-teksti" value={state.text}
                onChange={event => handleQuestionTextChanged(event.target.value)}
								onBlur={(event) => handleQuestionBlur(event)}
            />
        </div>
        <div>
            {state.answers.map( (answer) => {
                return (
                    <EditAnswer
                        key={answer.id}
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
