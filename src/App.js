
import './App.css';

import Exam from './Exam';

const App = () => {

  const answers1 = [
    {answer: "Vastaus_1_1", selected: false},
    {answer: "Vastaus_1_2", selected: false}
    ];

  const answers2 = [
    {answer: "Vastaus_2_1", selected: false},
    {answer: "Vastaus_2_2", selected: false}
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

  return (
    <div className='App'>
      {<Exam exam={exams[0]}/>}
    </div>
    );
};

export default App;
