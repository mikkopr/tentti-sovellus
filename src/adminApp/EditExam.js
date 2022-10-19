
import { useReducer } from 'react';
import '../App.css';
import EditQuestion from './EditQuestion';

const answerStub = {answer: 'Vastaus', isCorrect: false};
const questionStub = {question: 'Kysymys?', answers: [{...answerStub}]}

const EditExam = (props) => 
{
    const [exam, dispatch] = useReducer(reducer, props.exam);

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
        <div className='exam'>
            <h3>{exam.name}</h3>
            <div className='kysymys-lista'>
                {exam.questions.map( (question, index) => {
                    return (<EditQuestion 
                        key={index}
                        question={question}
                        questionIndex={index}
                        dispatch={dispatch}
                    /> )})
                }
            </div>
            <div>
                <input type='button' value='+'
                    onClick={event => dispatch(
                        {type: 'ADD_QUESTION_CLICKED',
                        payload: {}}
                    )}
                />
            </div>
        </div>
    );
};

export default EditExam;
