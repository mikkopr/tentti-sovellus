
import '../App.css';

import EditExam from './EditExam';
import ExamMenu from '../ExamMenu';

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
  
  return (
    <div className='App'>
      {<ExamMenu exams={exams}/>}
      {<EditExam exam={exams[0]} />}
    </div>
    )
}

export default AdminApp;
