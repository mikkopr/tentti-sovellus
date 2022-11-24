
import './App.css';

const Navbar = (props) =>
{
	return (
		<div className="navbar">
			<input type='button' value='Login' 
				onClick={(event) => props.dispatch({type:'SHOW_LOGIN_REQUESTED'})}
			/>
			<input type='button' value='Register' 
				onClick={(event) => props.dispatch({type:'SHOW_REGISTRATION_REQUESTED'})}
			/>
		</div>
	);
}

export default Navbar;