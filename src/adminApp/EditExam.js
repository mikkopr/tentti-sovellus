
import '../App.css';
import EditQuestion from './EditQuestion';

const EditExam = (props) => {
    return (
        <div className='exam'>
            <h3>{props.exam.name}</h3>
            <div className='kysymys-lista'>
                {props.exam.questions.map( (question, index) => {
                    return (<EditQuestion 
                        key={index}
                        question={question}
                        questionIndex={index}
                        dispatch={props.dispatch}
                    /> )})
                }
            </div>
            <div>
                <input type='button' value='+'
                    onClick={event => props.dispatch(
                        {type: 'ADD_QUESTION_CLICKED',
                        payload: {}}
                    )}
                />
            </div>
        </div>
    );
};

export default EditExam;