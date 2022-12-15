
const Toolbar = ({showExamTools, showExamListTools, admin, dispatch}) =>
{
	let tools;
	if (showExamListTools) {
		tools =
			<>
				{admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_ALL_EXAMS'})}>Kaikki</button>}
				{<button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_AVAILABLE_EXAMS'})}>Avoimet</button>}
				{admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_PAST_EXAMS'})}>Menneet</button>}
				{!admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_COMPLETED_ASSIGNMENTS'})}>Suoritetut</button>}
			</>
	}
	if (showExamTools) {
		tools =
			<>
				{admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_ASSIGNED_USERS'})}>Ilmoittautuneet</button>}
				{admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_EXAM_RESULTS'})}>Tulokset</button>}
			</>
	}

	return (
		<div className='toolbar'>
			{tools}
		</div>
	);
} 

export default Toolbar;


//{!admin && <button type="button" onClick={(evevnt) => dispatch({type: 'SHOW_ASSIGNMENTS_REQUESTED'})}>Ilmoittautumiset</button>}