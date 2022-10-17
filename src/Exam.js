
import './App.css';
import Question from './Question';

const Exam = (props) => {
    return (
        <div>
            <h3>{props.exam.name}</h3>
            <div className='kysymys-lista'>
                {props.exam.questions.map( question =>
                    <Question question={question} /> )}
            </div>
        </div>
    );
};

export default Exam;
