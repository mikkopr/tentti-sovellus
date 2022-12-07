import Answer from "./Answer";

const Question = (props) => {
	return (
		<div className="kysymys">
			<div className="kysymys-teksti">{props.question.text}</div>
				<div>
					{props.question.answers.map( (answer) =>
							<Answer 
								key={answer.id}
								answer={answer}
								questionId={props.question.id}
								checked={props.givenAnswers.has(props.question.id) && props.givenAnswers.get(props.question.id).has(answer.id)}
								dispatch={props.dispatch}/>
          )}
				</div>
			</div>
		);
}

export default Question;
