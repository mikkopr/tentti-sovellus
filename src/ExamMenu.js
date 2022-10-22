
import './App.css'

//import ExamMenuItem from "./ExamMenuItem";

const ExamMenu = (props) =>
{
    return (
        <div className="exam-menu">
            {props.exams.map( (exam, index) => 
                (<div key={index} className='exam-menu-item'
                    onClick={ (event) =>
                        props.dispatch(
                            {type: 'EXAM_SELECTED',
                            payload: index
                            })
                    }
                >
                    {exam.name}
                </div>)
            )}
        </div>
    );
}

export default ExamMenu;
