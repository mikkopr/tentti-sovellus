
const ErrorMessage = ({message, dispatch}) =>
{
	return (
		<div className="error">
			<h4>{message}</h4>
			<button type='button'
				onClick={() => dispatch({type: 'HIDE_ERROR_REQUESTED'})}
			>
				x
			</button>
		</div>
	);
}

export default ErrorMessage;
