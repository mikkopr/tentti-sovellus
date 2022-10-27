import { useState } from "react";

const Login = (props) =>
{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChanged = (value) => setUsername(value);
  const handlePasswordChanged = (value) => setPassword(value);

  return (
    <div className="login">
      <p>
        Käyttäjänimi: <input type='text' onChange={(event) => handleUsernameChanged(event.target.value)} />
      </p>
      <p>
        Salasana: <input type='text' onChange={(event) => handlePasswordChanged(event.target.value)} />
      </p>
      <p>
        <input type='button' value='Kirjaudu' onClick={() =>
          props.dispatch({type: 'USER_CREDENTIALS_RECEIVED', payload: {username: username, password: password}})
        }/>
      </p>
    </div>
  );
};

export default Login;
