
import Question from './Question';
import QuestionHeader from './adminApp/QuestionHeader';

const ExamEvent = (props) =>
{
	return (
		<>
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
