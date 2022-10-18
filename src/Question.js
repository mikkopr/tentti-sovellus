import Answer from "./Answer";

const Question = (props) => {
    return (
    <div className="kysymys">
        <div className="kysymys-teksti">{props.question.question}</div>
        <div>
            {props.question.answers.map( (answer, index) =>
                    <Answer 
                        key={index}
                        answer={answer}
                        answerIndex={index}
                        questionIndex={props.questionIndex}
                        onAnswerChanged={props.onAnswerChanged}
                    />
                )
            }
        </div>
    </div>
    );
} 

export default Question;