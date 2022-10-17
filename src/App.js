
import { useState } from 'react';

import './App.css';

import Exam from './Exam';

const answers1 = [
  {answer: "Vastaus_1_1", number: '1', selected: false},
  {answer: "Vastaus_1_2", number: '2', selected: true}
  ];

const answers2 = [
  {answer: "Vastaus_2_1", number: '1', selected: false},
  {answer: "Vastaus_2_2", number: '2', selected: false}
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

const App = () => {

  const [exam, setExam] = useState(exams[0]);

  const handleAnswerChanged = (isSelected, questionIndex, answerIndex) => {
    const examCopy = {...exam};
    examCopy.questions[questionIndex].answers[answerIndex].selected = isSelected;
    setExam(examCopy);
    console.log(examCopy);
  }  

  return (
    <div className='App'>
      {<Exam exam={exam} onAnswerChanged={handleAnswerChanged} />}
    </div>
    );
};

export default App;
