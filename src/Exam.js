
import './App.css';
import Question from './Question';

const Exam = (props) => {
    return (
        <div>
            <h3>{props.exam.name}</h3>
            <div className='kysymys-lista'>
                {props.exam.questions.map( (question, index) =>
                    <Question 
                        question={question}
                        questionIndex={index}
                        onAnswerChanged={props.onAnswerChanged} /> )}
            </div>
        </div>
    );
};

export default Exam;
