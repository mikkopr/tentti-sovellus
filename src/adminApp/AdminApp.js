
import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

import * as axiosConfig from '../axiosConfig';

import '../App.css';

import Navbar from '../Navbar'
import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';
import Login from '../Login';
import { fetchQuestionsForExam } from '../dataFunctions/examDataFunctions';
import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';
import Registration from '../Registration';
import ErrorMessage from '../ErrorMessage'
import QuestionList from './QuestionList';

const initialState = 
{
  user: {},
  exams: [],
	//activeExam: undefined,
	questionDataArray: undefined, //question data for selected exam, no answers
  selectedExamIndex: -1,
  failedToSave: false,
  dataFetchRequired: true,
  loggedIn: false,
  loginRequested: false,
  failedToAuthenticate: false,
	showLogin: false,
	showRegister: false,
	showExamList: false,
	showError: false,
	errorMessage: ''
};

//const STORAGE_KEY = 'examsData';
//const SERVER = 'http://localhost:8081';
const SERVER = 'http://localhost:8080';

const AdminApp = () => 
{
  const [examsState, dispatch] = useReducer(reducer, initialState);
  //const [initialized, setInitialized] = useState(false);

  useEffect ( () =>
  {
    const fetchData = async () => {
      console.log("Fetching data");
      try {
        const result = await axios(SERVER + '/tentit', axiosConfig.getConfig());
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

  useEffect( () =>
  {
    const postData = async () =>
    {
      try {
        const result = await axios.post(SERVER + '/login', {email: examsState.user.name, password: examsState.user.password});
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
				//const questions = await fetchQuestionsAndAnswersForExam(id);
				const questionDataArray = await fetchQuestionsForExam(id);
				dispatch({type: 'ACTIVE_EXAM_CHANGED', 
					payload: {examId: id, questionDataArray: questionDataArray} });
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
		console.log('handleActiveExamChanged(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		const examId = payload.examId;
		stateCopy.selectedExamIndex = stateCopy.exams.findIndex( (item) => item.id == examId );
		stateCopy.questionDataArray = [...payload.questionDataArray];
		return stateCopy;
	}

	function handleExamDataChanged(state, payload)
	{
		console.log('handleExamDataChanged(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		//const examIndex = stateCopy.exams.findIndex( (item) => item.id == payload.id );
		stateCopy.exams[stateCopy.selectedExamIndex] = 
			{...stateCopy.exams[stateCopy.selectedExamIndex], name: payload.name, description: payload.description,
				begin: payload.begin, end: payload.end, available_time: payload.available_time};
		return stateCopy;
	}

	function handleNewQuestionAddedToExam(state, payload)
	{
		console.log('handleNewQuestionAddedToExam(...)');
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]}; //TODO neccessary to copy exams array?
		stateCopy.questionDataArray = [...stateCopy.questionDataArray];
    stateCopy.questionDataArray.push(
			{id: payload.questionData.id, text: payload.questionData.text ,number: payload.questionData.number,
				points: payload.questionData.points});
		return stateCopy;
	}

	function handleQuestionRemovedFromExam(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray = stateCopy.questionDataArray.slice(0, questionIndex).concat(
			stateCopy.questionDataArray.slice(questionIndex + 1, stateCopy.questionDataArray.length));
		return stateCopy;
	}

	function handlequestionNumberChanged(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray[questionIndex].number = payload.number;
		return stateCopy;
	}

	function handlequestionPointsChanged(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray[questionIndex].points = payload.points;
		return stateCopy;
	}

  function reducer(state, action)
  {
    let stateCopy = {...state, exams: [...state.exams]};
    
    switch (action.type) 
		{ 
			case 'ACTIVE_EXAM_CHANGED':
				console.log('ACTIVE_EXAM_CHANGED');
				return handleActiveExamChanged(state, action.payload);

			case 'EXAM_DATA_CHANGED':
				console.log('EXAM_DATA_CHANGED');
				return handleExamDataChanged(state, action.payload);

			case 'NEW_QUESTION_ADDED_TO_EXAM':
				console.log('NEW_QUESTION_ADDED_TO_EXAM');
				return handleNewQuestionAddedToExam(state, action.payload);

			case 'QUESTION_REMOVED_FROM_EXAM':
				console.log('QUESTION_REMOVED_FROM_EXAM');
				return handleQuestionRemovedFromExam(state, action.payload);

			case 'QUESTION_NUMBER_CHANGED':
				console.log('QUESTION_NUMBER_CHANGED');
				return handlequestionNumberChanged(state, action.payload);
			case 'QUESTION_POINTS_CHANGED':
				console.log('QUESTION_POINTS_CHANGED');
				return handlequestionPointsChanged(state, action.payload)

      case 'DATA_RECEIVED':
      {
        console.log('DATA_RECEIVED');
        //stateCopy.exams = JSON.parse(JSON.stringify(action.payload));
        stateCopy.exams = action.payload;
        stateCopy.dataFetchRequired = false;
        stateCopy.failedToFetch = false;
        stateCopy.isSaveRequired = false;
        stateCopy.failedToSave = false;
        stateCopy.selectedExamIndex = -1;
        stateCopy.user = {...state.user};
        stateCopy.loggedIn = true;
        return stateCopy;
      }
      case 'FAILED_TO_FETCH_DATA':
        console.log('FAILED_TO_FETCH_DATA');
				console.log(action.payload?.message);
        return {...state, failedToFetch: true};
      
			case 'FAILED_TO_UPDATE_DATA':
				console.log('FAILED_TO_UPDATE_DATA ', action.payload?.err?.message);
				return {...state};
      
			case 'USER_CREDENTIALS_RECEIVED':
      {
        console.log('USER_CREDENTIALS_RECEIVED');
        const user = {name: action.payload.username, password: action.payload.password};
        return {...state, user: user, loggedIn: false, loginRequested: true, 
          authenticationFailed: false, notAuthorized: false, isSaveRequired: false, failedToSave: false, showLogin: false};
      }
      case 'CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED':
      {
        console.log('CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED');
        const responseStatus = action.payload.status;
        const userId = action.payload.data.userId;
				const email = action.payload.data.email;
				const role = action.payload.data.role;
				const token = action.payload.data.token;
        if (responseStatus == 200) {
					axiosConfig.setToken(token);
          return {...state, user: {userId: userId, email: email, role: role, token: token}, loggedIn: true, 
						loginRequested: false, dataFetchRequired: true};
        }
				/*else if (responseStatus == 403 || responseStatus == 401) //TODO status?
					return {...state, user: {...state.user}, loggedIn: false, loginRequested: false, failedToAuthenticate: true,
						showError: true, errorMessage: 'Käyttäjätunnus tai salasana väärä'};
				else*/
					return {...state, user: {...state.user}, loggedIn: false, loginRequested: false, failedToAuthenticate: true,
						showError: true, errorMessage: 'Tällaista ei pitäisi tapahtua'};
      }
      case 'FAILED_TO_VERIFY_CREDENTIALS':
        console.log('FAILED_TO_VERIFY_CREDENTIALS');
				if (action.payload.response?.status == 401 || action.payload.response?.status == 403) //TODO status
					return {...state, user: {...state.user}, loggedIn: false, failedToAuthenticate: true, 
						showLogin: true, showError: true, errorMessage: 'Käyttäjätunnus tai salasana väärä'};
				else {
					const message = action.payload.response?.error?.message ? 
						action.payload.response.error.message : 'Kirjautuminen epäonnistui'
	        return {...state, user: {...state.user}, loggedIn: false, failedToAuthenticate: true,
						showLogin: true, showError: true, errorMessage: message};
				}
      
			case 'LOG_OUT_REQUESTED':
        console.log('LOG_OUT_REQUESTED');
        return {...state, user: {}, loggedIn: false, notAuthorized: false};
      
			case 'SHOW_LOGIN_REQUESTED':
				console.log('SHOW_LOGIN_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: true, showRegister: false, showError: false};
			
			case 'SHOW_REGISTRATION_REQUESTED':
				console.log('SHOW_REGISTRATION_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, showError: false};

			case 'REGISTRATION_COMPLETED':
				console.log('REGISTRATION_COMPLETED');
				const userId = action.payload.data.userId;
				const email = action.payload.data.email;
				const role = action.payload.data.role;
				const token = action.payload.data.token;
				axiosConfig.setToken(token);
				return {...state, user: {userId: userId, email: email, role: role, token: token}, loggedIn: true, 
						loginRequested: false, dataFetchRequired: true, showLogin: false, showRegister: false, duplicateEmail: false};
			
			case 'REGISTRATION_FAILED':
			{
				console.log('REGISTRATION_FAILED');
				console.log(action.payload.error?.message);
				if (action.payload.status == 409) {
					console.log('duplicate email');
					return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, duplicateEmail: true};
				}
				else {
					return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, duplicateEmail: false, 
						showError: true, errorMessage: 'REGISTRATION_FAILED'};
				}

			}
			case 'HIDE_ERROR_REQUESTED':
				return {...state, showError: false};
			default:
        throw Error('Unknown event: ' + action.type);
    }
  }

  return (
    <div className='App'>
      <Navbar dispatch={dispatch}/>
			{examsState.loggedIn && <input type='button' value='Kirjaudu ulos' onClick={(event) =>
        dispatch({type: 'LOG_OUT_REQUESTED'})}/>
      }
			{examsState.showError && <ErrorMessage message={examsState.errorMessage} dispatch={dispatch}/>}
      {examsState.showRegister && <Registration dispatch={dispatch} duplicate={examsState.duplicateEmail}/>}
			{examsState.showLogin && <Login dispatch={dispatch}/>}
      {examsState.loggedIn && !examsState.dataFetchRequired && <ExamMenu exams={examsState.exams} onExamSelected={handleExamSelected}/>}
      {examsState.loggedIn && examsState.selectedExamIndex !== -1 && 
				<EditExam key={examsState.exams[examsState.selectedExamIndex].id} 
					exam={examsState.exams[examsState.selectedExamIndex]} dispatch={dispatch}/>}
			{examsState.loggedIn && examsState.selectedExamIndex !== -1 && 
				<QuestionList examId={examsState.exams[examsState.selectedExamIndex].id} questionDataArray={examsState.questionDataArray} dispatch={dispatch}/>}
      {examsState.loggedIn && examsState.failedToFetch && <p>Tietojen nouto palvelimelta epäonnistui</p>}
      {examsState.loggedIn && examsState.failedToSave && <p>Tietojen tallennus palvelimelle epäonnistui</p>}
      {examsState.loggedIn && examsState.notAuthorized && <p>Ei valtuuksia</p>}
    </div>
    )
}

export default AdminApp;
