import { useReducer } from 'react';

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

let exams = [exam1, exam2];

const AdminApp = () => 
{
  const [exam, dispatch] = useReducer(reducer, exams[0]);

  function reducer(state, action)
  {
    const stateCopy = {...state};
    
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
        //return {...state}.questions[action.payload.questionIndex].answers.push({...answerStub});
        stateCopy.questions[action.payload.questionIndex].answers.push({...answerStub});
        return stateCopy;
      case 'ADD_QUESTION_CLICKED':
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
      {<ExamMenu exams={exams}/>}
      {<EditExam exam={exam} dispatch={dispatch}/>}
    </div>
    )
}

export default AdminApp;
