
import { useEffect, useReducer, useState } from 'react';
import axios, { AxiosHeaders } from 'axios';

import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';
import Login from '../Login';
import { act } from 'react-dom/test-utils';

const answerStub = {answer: 'Vastaus', isCorrect: false};
const questionStub = {question: 'Kysymys?', answers: [{...answerStub}]}

const examsDataStub = 
{
  user: {},
  exams: [],
  selectedExam: -1,
  isSaveRequired: false,
  failedToSave: false,
  dataFetchRequired: true,
  loggedIn: false,
  loginRequested: false,
  failedToAuthenticate: false
};

const STORAGE_KEY = 'examsData';
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
        const result = await axios(SERVER); //returns object
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
  }, [examsState.isSaveRequired, examsState.loggedIn, examsState.failedToSave]);

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
      /*case 'INITIALIZE_DATA':
        const copyOfState = JSON.parse(JSON.stringify(action.payload));
        return copyOfState;*/
      /*case 'SAVE_REQUIRED_VALUE_CHANGED':
        console.log('SAVE_REQUIRED_VALUE_CHANGED');
        return {...state, isSaveRequired: action.payload};*/
      case 'EXAM_SELECTED':
        return {...state, selectedExam: action.payload};
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
      case 'DATA_RECEIVED':
      {
        console.log('DATA_RECEIVED');
        const stateCopy = JSON.parse(JSON.stringify(action.payload));
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
        return {...state, failedToFetch: true};
      case 'DATA_SAVED':
        console.log('DATA_SAVED');
        return {...state, isSaveRequired: false, failedToSave: false, notAuthorized: false};
      case 'FAILED_TO_SAVE_DATA':
      {
        console.log('FAILED_TO_SAVE_DATA');
        const responseStatus = action.payload;
        if (responseStatus == 403)
          return {...state, isSaveRequired: true, failedToSave: true, notAuthorized: true};
        else  
          return {...state, isSaveRequired: true, failedToSave: true};
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
      {examsState.loggedIn && !examsState.dataFetchRequired && <ExamMenu exams={examsState.exams} dispatch={dispatch}/>}
      {examsState.loggedIn && examsState.selectedExam > -1 && <EditExam exam={examsState.exams[examsState.selectedExam]} dispatch={dispatch}/>}
      {examsState.loggedIn && examsState.failedToFetch && <p>Tietojen nouto palvelimelta epäonnistui</p>}
      {examsState.loggedIn && examsState.failedToSave && <p>Tietojen tallennus palvelimelle epäonnistui</p>}
      {examsState.loggedIn && examsState.notAuthorized && <p>Ei valtuuksia</p>}
    </div>
    )
}

export default AdminApp;
