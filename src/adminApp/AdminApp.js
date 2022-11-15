
import { useEffect, useReducer, useState } from 'react';
import axios, { AxiosHeaders } from 'axios';

import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';
import Login from '../Login';
import { act } from 'react-dom/test-utils';
import { fetchQuestionsAndAnswersForExam } from '../dataFunctions/examDataFunctions';
import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';

const answerStub = {answer: 'Vastaus', isCorrect: false};
const questionStub = {question: 'Kysymys?', answers: [{...answerStub}]}

const examsDataStub = 
{
  user: {},
  exams: [],
	activeExam: undefined,
  selectedExam: -1,
  isSaveRequired: false,
  failedToSave: false,
  dataFetchRequired: true,
  loggedIn: false,
  loginRequested: false,
  failedToAuthenticate: false
};

//const STORAGE_KEY = 'examsData';
const SERVER = 'http://localhost:8081';
const DATA_SERVER = 'http://localhost:8080';

const AdminApp = () => 
{
  const [examsState, dispatch] = useReducer(reducer, examsDataStub);
  //const [initialized, setInitialized] = useState(false);

  useEffect ( () =>
  {
    const fetchData = async () => {
      console.log("Fetching data");
      try {
        const result = await axios(DATA_SERVER + '/tentit');
        dispatch({type: 'DATA_RECEIVED', payload: result.data});
      }
      catch (error) {
        console.log("Failed to fetch data");
        dispatch({type: 'FAILED_TO_FETCH_DATA', payload: error});
      }
    }
    if (examsState.dataFetchRequired && examsState.loggedIn) {
      fetchData();
    }
  }, [examsState.dataFetchRequired, examsState.loggedIn]);

  /*useEffect( () =>
  {
    const postData = async () =>
    {
      let result;
      try {
        result = await axios.post(SERVER, examsState); //returns object
        if (result.status >= 200 && result.status < 300)
          dispatch({type: 'DATA_SAVED', payload: result.data});
        else
          dispatch({type: 'FAILED_TO_SAVE_DATA', payload: result.status});
      }
      catch (error) {
        //Note that 403 ends up here!
        dispatch({type: 'FAILED_TO_SAVE_DATA', payload: error?.response?.status});
      }
    }
    if (examsState.isSaveRequired && examsState.loggedIn) {
      postData();
    }
  }, [examsState.isSaveRequired, examsState.loggedIn, examsState.failedToSave]);*/

  useEffect( () =>
  {
    const postData = async () =>
    {
      try {
        const result = await axios.post(SERVER + '/login', examsState.user);
        dispatch({type: 'CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED', 
          payload: {status: result.status, data: result.data}});
      }
      catch (error) {
        dispatch({type: 'FAILED_TO_VERIFY_CREDENTIALS', payload: error})
      }
    }
    if (examsState.loginRequested && !examsState.loggedIn) {
      postData();
    }
  }, [examsState.loginRequested, examsState.loggedIn]);

	async function handleExamSelected(id)
	{
		if (examsState.activeExam?.id === id) {
			return;
		}
		try {
				const questions = await fetchQuestionsAndAnswersForExam(id);
				dispatch({type: 'ACTIVE_EXAM_CHANGED', payload: {examId: id, questions: questions}});
		}
		catch (err) {
			if (err instanceof ServerError || err instanceof InvalidDataError) {
				//dispatch({type: 'SERVER_ERROR', payload: err});
				dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
			}
			dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
		}
	}

	function handleActiveExamChanged(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams]};
		const examId = payload.examId;
		const questions = payload.questions;
		const activeExam = state.exams.find( (item) => item.id == examId );
		activeExam.questions = questions;
		stateCopy.activeExam = activeExam;
		return stateCopy;
	}

	function handleNewQuestionAddedToExam(state, question)
	{
		console.log('handleNewQuestionAddedToExam(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		stateCopy.activeExam = {...state.activeExam, questions: [...state.activeExam.questions]};
		question.answers = [];
    stateCopy.activeExam.questions.push(question);
		return stateCopy;
	}

	function handleAnswerAdded(state, questionId, answer)
	{
		console.log('handleAnswerAdded(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		stateCopy.activeExam = {...state.activeExam, questions: [...state.activeExam.questions]};
		const questionIndex = stateCopy.activeExam.questions.findIndex( (item) => item.id == questionId);
		const modifiedQuestionCopy = 
			{...stateCopy.activeExam.questions[questionIndex],
				answers: [...stateCopy.activeExam.questions[questionIndex].answers]};
		modifiedQuestionCopy.answers.push(answer);
		stateCopy.activeExam.questions[questionIndex] = modifiedQuestionCopy;
		return stateCopy;
	}

	function handleAnswerDeleted(state, questionId, answerId)
	{
		//TODO maybe should reload the exam
		console.log('handleAnswerDeleted(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		stateCopy.activeExam = {...state.activeExam, questions: [...state.activeExam.questions]};

		const questionIndex = stateCopy.activeExam.questions.findIndex( (item) => item.id == questionId);
		const answerIndex = stateCopy.activeExam.questions[questionIndex].findIndex( (item) => item.id == answerId);

		const modifiedQuestionCopy = {...stateCopy.activeExam.questions[questionIndex]};
		modifiedQuestionCopy.answers = Array.concat(
			[...modifiedQuestionCopy.answers.slice(0, answerIndex)],
			[...modifiedQuestionCopy.answers.slice(answerIndex + 1, modifiedQuestionCopy.answers.length)] );
		
		stateCopy.activeExam.questions[questionIndex] = modifiedQuestionCopy;
		return stateCopy;
	}

  function reducer(state, action)
  {
    let stateCopy = {...state, exams: [...state.exams]};
    
    switch (action.type) {
      case 'ANSWER_VALUE_CHANGED':
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].answers[action.payload.answerIndex].answer =
          action.payload.value;
        stateCopy.isSaveRequired = true;
        stateCopy.failedToSave = false;
        return stateCopy;
      case 'ANSWER_CHECKED_STATE_CHANGED':
      { 
        stateCopy.exams[state.selectedExam] = 
          {...state.exams[state.selectedExam], questions: [...state.exams[state.selectedExam].questions]};
        const questionIndex = action.payload.questionIndex;
        //Make a shadow copy of the modified question and replace the current one
        stateCopy.exams[state.selectedExam].questions[questionIndex] = 
          {...state.exams[state.selectedExam].questions[questionIndex],
            answers: [...state.exams[state.selectedExam].questions[questionIndex].answers]
          };
        //Make a deep copy of the modified answer
        const answerIndex = action.payload.answerIndex;
        let answerCopyDeep = JSON.parse(JSON.stringify(
          stateCopy.exams[state.selectedExam].questions[questionIndex].answers[answerIndex]));
        answerCopyDeep.isCorrect = action.payload.value;
        stateCopy.exams[state.selectedExam].questions[questionIndex].answers[answerIndex] = answerCopyDeep;
        stateCopy.isSaveRequired = true;
        stateCopy.failedToSave = false;
        return stateCopy;
        /*
        stateCopy.exams[state.selectedExam] = 
          {...state.exams[state.selectedExam], questions: [...state.exams[state.selectedExam].questions]};
        const questionIndex = action.payload.questionIndex;
        let questionCopyDeep = JSON.parse(JSON.stringify(state.exams[state.selectedExam].questions[questionIndex]));
        questionCopyDeep.answers[action.payload.answerIndex].isCorrect = action.payload.value;
        stateCopy.exams[state.selectedExam].questions[questionIndex] = questionCopyDeep;
        stateCopy.isSaveRequired = true;
        return stateCopy;
        */
      }
      case 'ADD_ANSWER_CLICKED':
      {
        //Make a shallow copy of the modified exam and replace the current one in the exams array
        stateCopy.exams[state.selectedExam] = {...state.exams[state.selectedExam]};
        //Make a shadow copy of the questions array of the selected exam
        stateCopy.exams[state.selectedExam].questions = [...state.exams[state.selectedExam].questions];
        //Make a deep copy of the modified question and add a new answer to it
        const questionIndex = action.payload.questionIndex;
        let questionCopyDeep = JSON.parse(JSON.stringify(state.exams[state.selectedExam].questions[questionIndex]));
        questionCopyDeep.answers.push({...answerStub});
        //Replace the existing question object with the modified one
        stateCopy.exams[state.selectedExam].questions[questionIndex] = questionCopyDeep;
        stateCopy.isSaveRequired = true;
        stateCopy.failedToSave = false;
        return stateCopy;
      }
      case 'ADD_QUESTION_CLICKED':
        stateCopy.exams[state.selectedExam] = 
          {...state.exams[state.selectedExam], questions: [...state.exams[state.selectedExam].questions]};
        stateCopy.exams[state.selectedExam].questions.push({...questionStub});
        stateCopy.isSaveRequired = true;
        stateCopy.failedToSave = false;
        return stateCopy;
      case 'QUESTION_VALUE_CHANGED':
      {
        //Make a deep copy only of the modified question
        stateCopy.exams[state.selectedExam] = 
          {...state.exams[state.selectedExam], questions: [...state.exams[state.selectedExam].questions]};
        let questionCopyDeep = JSON.parse(JSON.stringify(state.exams[state.selectedExam].questions[action.payload.questionIndex]));
        questionCopyDeep.question = action.payload.value;
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex] = questionCopyDeep;
        stateCopy.isSaveRequired = true;
        stateCopy.failedToSave = false;
        return stateCopy;
      }

			case 'ANSWER_ADDED':
				console.log('ANSWER_ADDED');
				return handleAnswerAdded(state, action.payload.questionId, action.payload.answer);
			case 'ANSWER_DELETED':
				console.log('ANSWER_DELETED');
				return handleAnswerDeleted(state, action.payload.questionId, action.payload.answerId);
			case 'NEW_QUESTION_ADDED_TO_EXAM':
				console.log('NEW_QUESTION_ADDED_TO_EXAM');
				return handleNewQuestionAddedToExam(state, action.payload.question);

      /*case 'INITIALIZE_DATA':
        const copyOfState = JSON.parse(JSON.stringify(action.payload));
        return copyOfState;*/
      /*case 'SAVE_REQUIRED_VALUE_CHANGED':
        console.log('SAVE_REQUIRED_VALUE_CHANGED');
        return {...state, isSaveRequired: action.payload};*/
      /*case 'INITIAL_DATA_RECEIVED':
      {
        console.log('INITIAL_DATA_RECEIVED');
        const stateCopy = JSON.parse(JSON.stringify(action.payload));
        stateCopy.dataFetchRequired = false;
        stateCopy.failedToFetch = false;
        stateCopy.selectedExam = -1;
        stateCopy.isSaveRequired = false;
        return stateCopy;
      }*/
			case 'ACTIVE_EXAM_CHANGED':
				console.log('ACTIVE_EXAM_CHANGED');
				const nextSate = handleActiveExamChanged(state, action.payload);
        return nextSate;
      case 'DATA_RECEIVED':
      {
        console.log('DATA_RECEIVED');
        //stateCopy.exams = JSON.parse(JSON.stringify(action.payload));
        stateCopy.exams = action.payload;
        stateCopy.dataFetchRequired = false;
        stateCopy.failedToFetch = false;
        stateCopy.isSaveRequired = false;
        stateCopy.failedToSave = false;
        stateCopy.selectedExam = -1;
        //TODO: GET doesn't check credentials and may returned data may not have user object
        stateCopy.user = {...state.user};
        stateCopy.loggedIn = true;
        return stateCopy;
      }
      case 'FAILED_TO_FETCH_DATA':
        console.log('FAILED_TO_FETCH_DATA');
				console.log(action.payload?.message);
        return {...state, failedToFetch: true};
      case 'DATA_SAVED':
        console.log('DATA_SAVED');
        return {...state, isSaveRequired: false, failedToSave: false, notAuthorized: false};
      case 'FAILED_TO_SAVE_DATA':
      {
        console.log('FAILED_TO_SAVE_DATA');
        /*const responseStatus = action.payload;
        if (responseStatus == 403)
          return {...state, isSaveRequired: true, failedToSave: true, notAuthorized: true};
        else  
          return {...state, isSaveRequired: true, failedToSave: true};*/
      }
      case 'USER_CREDENTIALS_RECEIVED':
      {
        console.log('USER_CREDENTIALS_RECEIVED');
        const user = {name: action.payload.username, password: action.payload.password};
        return {...state, user: {...user, verified: false}, loggedIn: false, loginRequested: true, 
          authenticationFailed: false, notAuthorized: false, isSaveRequired: false, failedToSave: false};
      }
      case 'CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED':
      {
        console.log('CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED');
        const responseStatus = action.payload.status;
        const user = action.payload.data;
        if (responseStatus == 200 && user.verified === true) {
          return {...state, user: {...user}, loggedIn: true, loginRequested: false, dataFetchRequired: true};
        }
        return {...state, user: {...user, verified: false}, loggedIn: false, loginRequested: false, failedToAuthenticate: true};
      }
      case 'FAILED_TO_VERIFY_CREDENTIALS':
        console.log('FAILED_TO_VERIFY_CREDENTIALS');
        return {...state, user: {...state.user, verified: false}, loggedIn: false, failedToAuthenticate: true};
      case 'LOG_OUT_REQUESTED':
        console.log('LOG_OUT_REQUESTED');
        return {...state, user: {}, loggedIn: false, notAuthorized: false};
      default:
        throw Error('Unknown event: ' + action.type);
    }
  }

  return (
    <div className='App'>
      {examsState.loggedIn && <input type='button' value='Kirjaudu ulos' onClick={(event) =>
        dispatch({type: 'LOG_OUT_REQUESTED'})}/>
      }
      {!examsState.loggedIn && <Login dispatch={dispatch}/>}
      {!examsState.loggedIn && examsState.failedToAuthenticate && <p>Käyttäjätunnus tai salasana virheellinen!</p>}
      {examsState.loggedIn && !examsState.dataFetchRequired && <ExamMenu exams={examsState.exams} onExamSelected={handleExamSelected}/>}
      {examsState.loggedIn && examsState.activeExam !== undefined && <EditExam exam={examsState.activeExam} dispatch={dispatch}/>}
      {examsState.loggedIn && examsState.failedToFetch && <p>Tietojen nouto palvelimelta epäonnistui</p>}
      {examsState.loggedIn && examsState.failedToSave && <p>Tietojen tallennus palvelimelle epäonnistui</p>}
      {examsState.loggedIn && examsState.notAuthorized && <p>Ei valtuuksia</p>}
    </div>
    )
}

export default AdminApp;
