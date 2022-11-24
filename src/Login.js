import { useState } from "react";

const Login = (props) =>
{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChanged = (value) => setUsername(value);
  const handlePasswordChanged = (value) => setPassword(value);

	const handleSubmit = (event) =>
	{
		//TODO post login request first and then dispatch
		event.preventDefault();
		props.dispatch({type: 'USER_CREDENTIALS_RECEIVED', payload: {username: username, password: password}});
	}

  return (
    <div className="login">
			<form onSubmit={(event) => handleSubmit(event)}>
				<p>
					Käyttäjänimi: <input type='text' onChange={(event) => handleUsernameChanged(event.target.value)} />
				</p>
				<p>
					Salasana: <input type='password' onChange={(event) => handlePasswordChanged(event.target.value)} />
				</p>
				<p>
					<input type='submit' value='Kirjaudu'/>
				</p>
			</form>
    </div>
  );
};

export default Login;
