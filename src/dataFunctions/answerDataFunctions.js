
import axios from 'axios';

import * as axiosConfig from '../axiosConfig';

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
		fetchResult = await axios.get(`/kysymykset/${questionId}/vastaukset`, axiosConfig.getConfig());
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
		fetchResult = await axios.post(`/kysymykset/${questionId}/vastaus`, answerStub, axiosConfig.getConfig());
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

const deleteAnswer = async (answerId) =>
{
	try {
		const fetchResult = await axios.delete(`/vastaukset/${answerId}`, axiosConfig.getConfig());
		return fetchResult;
	}
	catch (err) {
		throw err;
	}
}

const updateAnswer = async (answerId, text, correct) =>
{
	let fetchResult = undefined;
	try {
		const answer = {text: text, correct: correct};
		fetchResult = await axios.put(`/vastaukset/${answerId}`, answer, axiosConfig.getConfig());
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

export {fetchAnswers, addAnswer, deleteAnswer, updateAnswer};
