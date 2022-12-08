
import Question from './Question';
import QuestionHeader from './adminApp/QuestionHeader';

const ExamEvent = (props) =>
{
	function maxPoints(exam)
	{
		if (!exam || !exam.questions)
			return 0;
		return exam.questions.reduce((sumOfPoints, curr) => sumOfPoints += curr.points, 0);
	}

	return (
		<>
			{!props.examEvent.examAssignment.completed && 
				<div className='toolbar'>
					<button type='button' onClick={event => props.dispatch({type:'EXAM_EVENT_SAVE_CLICKED'})}>Tallenna</button>
					<button type='button' onClick={event => props.dispatch({type:'EXAM_EVENT_FINISH_CLICKED'})}>Palauta</button>
				</div>
			}
			
			{props.examEvent.examAssignment.completed && <div>Olet palauttanut tentin {props.examEvent.exam.name}</div>}
			
			{props.examEvent.examAssignment.completed && props.examEvent.examAssignment.checked &&
				<div>Pisteet: {props.examEvent.examAssignment.points} / {maxPoints(props.examEvent.exam)}</div>}
			
			{!props.examEvent.examAssignment.completed && 
				props.examEvent?.exam.questions.map((question) => { return (
					<div key={question.id}>
						<QuestionHeader examId={props.examEvent?.exam.id} questionId={question.id} number={question.number} points={question.points}
							allowEdit={false} dispatch={props.dispatch}/>
						<Question
							question={question}
							givenAnswers={props.examEvent?.givenAnswers}
							dispatch={props.dispatch}/>
					</div>
				)})
			}
		</>
	);
}

export default ExamEvent;
