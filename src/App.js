
import './App.css';

import Exam from './Exam';

const App = () => {

  let question1 = {question: "Ensimmäinen kysymys?", correctAnswerIndex: 0, answers: ["vastaus1","vastaus2"]};
  let question2 = {question: "Toinen kysymys?", correctAnswerIndex: 0, answers: ["vastaus1","vastaus2"]};

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
