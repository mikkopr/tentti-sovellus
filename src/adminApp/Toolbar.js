
const Toolbar = (props) =>
{
	return (
		<div className='toolbar'>
			<button type="button" onClick={(evevnt) => props.dispatch({type: 'SHOW_EXAM_LIST_REQUESTED'})}  >Tentit</button>
		</div>
	);
} 

export default Toolbar;
