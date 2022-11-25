
const ErrorMessage = ({message, dispatch}) =>
{
	return (
		<div className="error">
			<h3>{message}</h3>
			<button
				onClick={() => dispatch({type: 'HIDE_ERROR_REQUESTED'})}
			>
				x
			</button>
		</div>
	);
}

export default ErrorMessage;
