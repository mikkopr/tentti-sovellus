
const Answer = (props) => {
    return (
        <div>
            <input type='checkbox' name='answer' 
                value={props.answer.number}
                checked={props.answer.selected}
                onChange={(event) =>
                    props.onAnswerChanged(
                        event.target.checked, props.questionIndex, props.answerIndex)
                }
            />
            {props.answer.answer}
        </div>);
}

export default Answer;
