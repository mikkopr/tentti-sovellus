
import axios from 'axios';

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
		throw err;
	}
	if (fetchResult.status === 200 && !Array.isArray(fetchResult.data)) {
			throw new InvalidDataError('Received invalid data');
	}
	return fetchResult.data;
}

const addAnswer = async (questionId) =>
{
	let fetchResult = undefined;
	try {
		const answerStub = {teksti: 'vastaus', oikein: false};
		fetchResult = await axios.post(`http://localhost:8080/kysymykset/${questionId}/vastaus`, answerStub);
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

const deleteAnswer = async (answerId) =>
{
	try {
		const fetchResult = await axios.delete(`http://localhost:8080/vastaukset/${answerId}`);
		return fetchResult;
	}
	catch (err) {
		throw err;
	}
}

export {fetchAnswers, addAnswer, deleteAnswer};
