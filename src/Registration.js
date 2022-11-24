
import { useState } from "react";
import axios from 'axios';

import * as axiosConfig from './axiosConfig';

const Registration = (props) =>
{
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleNameChanged = (value) => setName(value);
	const handleEmailChanged = (value) => setEmail(value);
	const handlePasswordChanged = (value) => setPassword(value);

	const handleSubmit = async (event) =>
	{
		event.preventDefault();
		let result;
		try {
			result = await axios.post('http://localhost:8080/register', {name: name, email: email, password: password});
			//if (result.status == 201)
			props.dispatch({type: 'REGISTRATION_COMPLETED', payload: {status: result.status, data: result.data}});
		}
		catch (err) {
			props.dispatch({type: 'REGISTRATION_FAILED', payload: {status: err.response.status, error: err}});
			return;
		}
	}

  return (
  	<div className="login">
			{props.duplicate && <p>Sähköpostiosoite on jo käytössä</p>}
			<form onSubmit={(event) => handleSubmit(event)}>
				<p>
					Nimi: <input type='text' onChange={(event) => handleNameChanged(event.target.value)} />
				</p>
				<p>
					Sähköposti: <input type='text' onChange={(event) => handleEmailChanged(event.target.value)} />
				</p>
				<p>
					Salasana: <input type='password' onChange={(event) => handlePasswordChanged(event.target.value)} />
				</p>
				<p>
					<input type='submit' value='Rekisteröidy'/>
				</p>
			</form>
		</div>
	);
};

export default Registration;
