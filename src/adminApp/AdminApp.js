
import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';
import Login from '../Login';

const answerStub = {answer: 'Vastaus', isCorrect: false};
const questionStub = {question: 'Kysymys?', answers: [{...answerStub}]}

const examsDataStub = 
{
  user: {},
  exams: [],
  selectedExam: -1,
  isSaveRequired: false,
  dataFetchRequired: true,
  loggedIn: false
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
      try {
        const result = await axios.post(SERVER, examsState); //returns object
        dispatch({type: 'DATA_SAVED', payload: result.data});
      }
      catch (error) {
        dispatch({type: 'FAILED_TO_SAVE_DATA', payload: error})
      }
    }
    if (examsState.isSaveRequired && examsState.loggedIn) {
      postData();
    }
  }, [examsState.isSaveRequired, examsState.loggedIn]);

  function reducer(state, action)
  {
    let stateCopy = {...state, exams: [...state.exams]};
    
    switch (action.type) {
      case 'ANSWER_VALUE_CHANGED':
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].answers[action.payload.answerIndex].answer =
          action.payload.value;
        stateCopy.isSaveRequired = true;
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
        return stateCopy;
      }
      case 'ADD_QUESTION_CLICKED':
        stateCopy.exams[state.selectedExam] = 
          {...state.exams[state.selectedExam], questions: [...state.exams[state.selectedExam].questions]};
        stateCopy.exams[state.selectedExam].questions.push({...questionStub});
        stateCopy.isSaveRequired = true;
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
        return {...state, user: {...action.payload},isSaveRequired: false, failedToSave: false};
      case 'FAILED_TO_SAVE_DATA':
        console.log('FAILED_TO_SAVE_DATA');
        return {...state, isSaveRequired: true, failedToSave: true};
      case 'USER_CREDENTIALS_RECEIVED':
      {
        console.log('USER_CREDENTIALS_RECEIVED');
        const user = {name: action.payload.username, password: action.payload.password};
        return {...state, user: user, loggedIn: true};
      }
      case 'LOG_OUT_REQUESTED':
        console.log('LOG_OUT_REQUESTED');
        return {...state, user: {}, loggedIn: false};
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
      {examsState.loggedIn && !examsState.dataFetchRequired && <ExamMenu exams={examsState.exams} dispatch={dispatch}/>}
      {examsState.loggedIn && examsState.selectedExam > -1 && <EditExam exam={examsState.exams[examsState.selectedExam]} dispatch={dispatch}/>}
      {examsState.failedToFetch && <p>Tietojen nouto palvelimelta epäonnistui</p>}
      {examsState.failedToSave && <p>Tietojen tallennus palvelimelle epäonnistui</p>}
    </div>
    )
}

export default AdminApp;
