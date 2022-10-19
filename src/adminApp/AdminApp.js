
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
const examsData = 
{
  exams: [exam1, exam2],
  selectedExam: 0,
  isSaveRequired: false
};

const AdminApp = () => 
{
  const [examsData, dispatch] = useReducer(reducer, examsData);

  useEffect( () =>
  {
    const examData = localStorage.getItem('examData');
    if (examData == null) {
      
    }
  }, []);

  function reducer(state, action)
  {
    let stateCopy = {...state};
    
    switch (action.type) {
      case 'ANSWER_VALUE_CHANGED':
        stateCopy.questions[action.payload.questionIndex].answers[action.payload.answerIndex].answer =
          action.payload.value;
        return stateCopy;
      case 'ANSWER_CHECKED_STATE_CHANGED':
        stateCopy.questions[action.payload.questionIndex].answers[action.payload.answerIndex].isCorrect =
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
        stateCopy.questions[action.payload.questionIndex].answers.push({...answerStub});
        return stateCopy;
      case 'ADD_QUESTION_CLICKED':
        stateCopy.questions = stateCopy.questions.slice();
        stateCopy.questions.push({...questionStub});
        return stateCopy;
      case 'QUESTION_VALUE_CHANGED':
        stateCopy.questions[action.payload.questionIndex].question = action.payload.value;
        return stateCopy;
      default:
        throw Error('Unknown event: ' + action.type);
    }
  }

  return (
    <div className='App'>
      {<ExamMenu exams={exams} dispatch={dispatch}/>}
      {<EditExam exam={exam} dispatch={dispatch}/>}
    </div>
    )
}

export default AdminApp;
