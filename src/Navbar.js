
import './App.css';

const Navbar = ({loggedIn, admin, dispatch, handleShowExamListClicked, handleShowAssignmentsClicked}) =>
{
	return (
		<div className="navbar">
			{!loggedIn && <button type='button'	onClick={(event) => dispatch({type:'SHOW_LOGIN_REQUESTED'})}>Kirjaudu</button>}
			{!loggedIn && <button type='button'	onClick={(event) => dispatch({type:'SHOW_REGISTRATION_REQUESTED'})}>Rekisteröidy</button>}
			{loggedIn && <button type="button" onClick={(event) => dispatch({type: 'SHOW_EXAM_LIST_REQUESTED'})}>Tentit</button>}
			{loggedIn && admin &&	<button type="button" onClick={(event) => dispatch({type: 'SHOW_USER_LIST_REQUESTED'})}>Käyttäjät</button>}
			{loggedIn && !admin &&	<button type="button" onClick={(event) => handleShowAssignmentsClicked()}>Ilmoittautumiset</button>}
			{loggedIn && <button type='button' onClick={(event) => dispatch({type:'LOG_OUT_REQUESTED'})}>Kirjaudu ulos</button>}
		</div>
	);
}

export default Navbar;

//{loggedIn && <button type="button" onClick={(event) => handleShowExamListClicked()}>Tentit</button>}
//