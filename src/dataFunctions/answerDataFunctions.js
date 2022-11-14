
import axios from 'axios';

import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';

/**
 * Fetches the answers of the questions.
 * 
 * Return an array of answers
 */
const fetchAnswers = async (questionId) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.get(`http://localhost:8080/kysymykset/${questionId}/vastaukset`);
	}
	catch (err) {
		if (err.response.status >= 500 && err.response.status < 600) {
			throw new ServerError('Server was unable to fulfill the request', err.response.status);
		}
		throw err;
	}
	if (fetchResult.status === 200) {
		if (!Array.isArray(fetchResult.data)) {
			throw new InvalidDataError('Received invalid data');
		}
		return fetchResult.data;
	}
	throw new ServerError('Server was unable to fulfill the request', fetchResult.status);
}

export {fetchAnswers};
