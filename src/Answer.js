
const Answer = (props) => 
{
	function handleAnswerCheckedStateChanged(checked)
	{
		props.dispatch({type: 'EXAM_EVENT_ANSWER_CHANGED', 
			payload: {answerId: props.answer.id, questionId: props.questionId, checked: checked}});
	}

	return (
		<div>
			<input type='checkbox' name='answer' 
				checked={props.checked}
				onChange={(event) => handleAnswerCheckedStateChanged(event.target.checked)}
      />
      {props.answer.text}
    </div>);
}

export default Answer;
