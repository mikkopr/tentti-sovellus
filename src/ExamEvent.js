
import Question from './Question';
import QuestionHeader from './adminApp/QuestionHeader';

const ExamEvent = (props) =>
{
	function handleSaveClicked()
	{
		props.dispatch({type:'EXAM_EVENT_SAVE_CLICKED'});
	}
	return (
		<>
			<div className='toolbar'>
				<button type='button' onClick={event => handleSaveClicked()}>Tallenna</button>
			</div>
			{props.examEvent?.exam.questions.map((question) => { return (
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
