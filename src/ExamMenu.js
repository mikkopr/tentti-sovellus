
import './App.css'

import ExamMenuItem from "./ExamMenuItem";

const ExamMenu = (props) =>
{
    return (
        <div className="exam-menu">
            {props.exams.map( (exam, index) => 
                <ExamMenuItem key={index} examName={exam.name} examIndex={index} /> )
            }
        </div>
    );
}

export default ExamMenu;
