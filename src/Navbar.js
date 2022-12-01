
import './App.css';

const Navbar = (props) =>
{
	return (
		<div className="navbar">
			{!props.loggedIn && <button type='button'	onClick={(event) => props.dispatch({type:'SHOW_LOGIN_REQUESTED'})}>Kirjaudu</button>}
			{!props.loggedIn && <button type='button'	onClick={(event) => props.dispatch({type:'SHOW_REGISTRATION_REQUESTED'})}>Rekisteröidy</button>}
			{props.loggedIn && <button type='button'	onClick={(event) => props.dispatch({type:'LOG_OUT_REQUESTED'})}>Kirjaudu ulos</button>}
		</div>
	);
}

export default Navbar;