
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
//const SERVER = 'http://localhost:8081';
const SERVER = 'http://localhost:8080';

const AdminApp = () => 
{
  const [examsState, dispatch] = useReducer(reducer, examsDataStub);
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
		let arr = [];
		const activeExam = {...stateCopy.exams.find( (item) => item.id == examId )};
		activeExam.questionDataArray = [...payload.questionDataArray];
		stateCopy.activeExam = activeExam;
		return stateCopy;
	}

	function handleNewQuestionAddedToExam(state, payload)
	{
		console.log('handleNewQuestionAddedToExam(...)');
		const stateCopy = {...state, exams: [...state.exams]}; //TODO neccessary to copy exams array?
		stateCopy.activeExam = {...stateCopy.activeExam};
		stateCopy.activeExam.questionDataArray = [...stateCopy.activeExam.questionDataArray];
    stateCopy.activeExam.questionDataArray.push(
			{id: payload.questionData.id, text: payload.questionData.text ,number: payload.questionData.number, points: payload.questionData.points});
		return stateCopy;
	}

	function handleQuestionRemovedFromExam(state, payload)
	{
		const stateCopy = {...state};
		stateCopy.activeExam = {...stateCopy.activeExam};
		const questionIndex = stateCopy.activeExam.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.activeExam.questionDataArray = stateCopy.activeExam.questionDataArray.slice(0, questionIndex).concat(
			stateCopy.activeExam.questionDataArray.slice(questionIndex + 1, stateCopy.activeExam.questionDataArray.length));
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

			case 'NEW_QUESTION_ADDED_TO_EXAM':
				console.log('NEW_QUESTION_ADDED_TO_EXAM');
				return handleNewQuestionAddedToExam(state, action.payload);

			case 'QUESTION_REMOVED_FROM_EXAM':
				console.log('QUESTION_REMOVED_FROM_EXAM');
				return handleQuestionRemovedFromExam(state, action.payload);

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
      
			/*case 'FAILED_TO_SAVE_DATA':
        console.log('FAILED_TO_SAVE_DATA');
        return {...state};*/
      
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
        return {...state, user: {...state.user}, loggedIn: false, loginRequested: false, failedToAuthenticate: true};
      }
      case 'FAILED_TO_VERIFY_CREDENTIALS':
        console.log('FAILED_TO_VERIFY_CREDENTIALS');
        return {...state, user: {...state.user}, loggedIn: false, failedToAuthenticate: true};
      case 'LOG_OUT_REQUESTED':
        console.log('LOG_OUT_REQUESTED');
        return {...state, user: {}, loggedIn: false, notAuthorized: false};
      
			case 'SHOW_LOGIN_REQUESTED':
				console.log('SHOW_LOGIN_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: true, showRegister: false};
			
			case 'SHOW_REGISTRATION_REQUESTED':
				console.log('SHOW_REGISTRATION_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true};

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
					return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, duplicateEmail: false};
				}
			}
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
      {examsState.showRegister && <Registration dispatch={dispatch} duplicate={examsState.duplicateEmail}/>}
			{examsState.showLogin && <Login dispatch={dispatch}/>}
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
