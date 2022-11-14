
import '../App.css';
import EditQuestion from './EditQuestion';

const EditExam = (props) => 
{
    return (
        <div className='exam'>
            <h3>{props.exam.nimi}</h3>
            <div className='kysymys-lista'>
                {props.exam.questions.map( (question) => {
                    return (<EditQuestion 
                        key={question.id}
                        question={question}
                        dispatch={props.dispatch}
                    /> )})
                }
            </div>
            <div>
                <input type='button' value='+'
                    onClick={event => props.dispatch(
                        {type: 'ADD_QUESTION_CLICKED'}
                    )}
                />
            </div>
        </div>
    );
};

export default EditExam;
