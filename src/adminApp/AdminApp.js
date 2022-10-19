
import { useEffect, useReducer } from 'react';

import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';
import { act } from 'react-dom/test-utils';

const answerStub = {answer: 'Vastaus', isCorrect: false};
const questionStub = {question: 'Kysymys?', answers: [{...answerStub}]}

const answers1 = [
  {answer: "Vastaus_1_1", isCorrect: true},
  {answer: "Vastaus_1_2", isCorrect: false}
  ];

const answers2 = [
  {answer: "Vastaus_2_1", isCorrect: false},
  {answer: "Vastaus_2_2", isCorrect: true}
  ];

let question1 = {question: "Ensimmäinen kysymys?", answers: answers1};
let question2 = {question: "Toinen kysymys?", answers: answers2};

let exam1 = {
  name: "Haskell perusteet",
  questions: [question1, question2]
};

let exam2 = {
  name: "Javascript perusteet",
  questions: [question1, question2]
};

//let exams = [exam1, exam2];
const examsDataStub = 
{
  exams: [exam1, exam2],
  selectedExam: 0,
  isSaveRequired: false,
  isDataInitialized: false
};

const STORAGE_KEY = 'examsData';

const AdminApp = () => 
{
  const [examsState, dispatch] = useReducer(reducer, examsDataStub);

  useEffect( () =>
  {
    const examsData = localStorage.getItem(STORAGE_KEY);
    //TODO: verify the data
    if (examsData == null) {
      console.log('No exams data in storage, uses an initial object for data');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examsDataStub));
      dispatch({type: 'INITIALIZE_DATA', payload: examsData});
    }
    else {
      console.log('Uses exams data in storage');
      dispatch({type: 'INITIALIZE_DATA', payload: JSON.parse(examsData)});
    }
  }, []);

  // Saves state object to storage when examsState.isSaveRequired == true
  useEffect( () =>
  {
    if (examsState.isSaveRequired) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examsState));
      dispatch({type: 'SAVE_REQUIRED_VALUE_CHANGED', payload: false});
    }
  }, [examsState.isSaveRequired]);

  function reducer(state, action)
  {
    let stateCopy = {...state};
    
    switch (action.type) {
      case 'ANSWER_VALUE_CHANGED':
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].answers[action.payload.answerIndex].answer =
          action.payload.value;
        return stateCopy;
      case 'ANSWER_CHECKED_STATE_CHANGED':
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].answers[action.payload.answerIndex].isCorrect =
          action.payload.value;
        return stateCopy;
      case 'ADD_ANSWER_CLICKED':
        //const answersCopy = stateCopy.question[action.payload.questionIndex].answers.map( answer =>
        //console.log("add answer");
        //stateCopy.questions[action.payload.questionIndex].answers.push({...answerStub});
        //Shallow copy doesn't work properly, adds two answers:
        /*stateCopy.questions = stateCopy.questions.slice();
        stateCopy.questions[action.payload.questionIndex].answers = 
          stateCopy.questions[action.payload.questionIndex].answers.slice();
        stateCopy.questions[action.payload.questionIndex].answers.push({...answerStub});
        return stateCopy;*/
        //TODO: make a deep copy manually without JSON
        stateCopy = JSON.parse(JSON.stringify(state));
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].answers.push({...answerStub});
        return stateCopy;
      case 'ADD_QUESTION_CLICKED':
        stateCopy.exams[state.selectedExam].questions = stateCopy.questions.slice();
        stateCopy.exams[state.selectedExam].questions.push({...questionStub});
        return stateCopy;
      case 'QUESTION_VALUE_CHANGED':
        stateCopy.exams[state.selectedExam].questions[action.payload.questionIndex].question = action.payload.value;
        return stateCopy;
      case 'INITIALIZE_DATA':
        const copyOfState = JSON.parse(JSON.stringify(action.payload));
        //Note: isDataInitialized not used anywhere yet
        copyOfState.isDataInitialized = true;
        return copyOfState;
      case 'SAVE_REQUIRED_VALUE_CHANGED':
        return {...state, isSaveRequired: action.payload};
      default:
        throw Error('Unknown event: ' + action.type);
    }
  }

  return (
    <div className='App'>
      {<ExamMenu exams={examsState.exams} dispatch={dispatch}/>}
      {<EditExam exam={examsState.exams[examsState.selectedExam]} dispatch={dispatch}/>}
    </div>
    )
}

export default AdminApp;
