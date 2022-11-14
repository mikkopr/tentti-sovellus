
import './App.css'

const ExamMenu = (props) =>
{
	return (
		<div className="exam-menu">
  	{props.exams.map( (exam) => {
  			return (<div key={exam.id} className='exam-menu-item' onClick={ 
					(event) => props.onExamSelected(exam.id) }
				>
					{exam.nimi}
      	</div>)
				})
		}
    </div>
  );
}

export default ExamMenu;
