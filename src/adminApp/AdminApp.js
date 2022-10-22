
import { useEffect, useReducer } from 'react';

import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';

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
      dispatch({type: 'INITIALIZE_DATA', payload: examsDataStub});
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
      case 'INITIALIZE_DATA':
        const copyOfState = JSON.parse(JSON.stringify(action.payload));
        return copyOfState;
      case 'SAVE_REQUIRED_VALUE_CHANGED':
        //console.log('SAVE_REQUIRED_VALUE_CHANGED value:' + action.payload);
        return {...state, isSaveRequired: action.payload};
      case 'EXAM_SELECTED':
        return {...state, selectedExam: action.payload};
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
