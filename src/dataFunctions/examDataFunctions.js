
import axios from 'axios';

import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';
import {fetchAnswers} from './answerDataFunctions';

const fetchQuestionsAndAnswersForExam = async (id) =>
{
	let result = [];
	const questions = await fetchQuestionsForExam(id);
	if (questions === undefined || questions.length === 0) {
		return result;
	}
	result = questions;
	for (let i=0; i < result.length; i++) {
		result[i].answers = await fetchAnswers(result[i].id);
	}
	/* DOESN'T AWAIT result!!!
	result = questions.map( async (item) => {
		item.answers = await fetchAnswers(item.id);
		return item;
	});
	*/
	return result;
}

/**
 * Fetches the questions of the exam.
 * 
 * Return an array of questions
 */
const fetchQuestionsForExam = async (id) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.get('http://localhost:8080/tenttikysymykset/tentti/' + id);
	}
	catch (err) {
		//If not found in database the body contains sender: 'application'
		/*if (err.response.status === 404 && err.response.data.sender === 'application') {
			return undefined;
		}*/
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

const updateExam = async (exam) =>
{
	let result = undefined;
	try {
		result = await axios.put('http://localhost:8080/tentit/' + exam.id);
	}
	catch (err) {
		//If not found in database the body contains sender: 'application'
		if (err.response.status === 404 && err.response.data.sender === 'application') {
			return undefined;
		}
		if (err.response.status >= 500 && err.response.status < 600) {
			throw new ServerError('Server was unable to fulfill the request', err.response.status);
		}
		throw err;
	}
	if (result.status === 200) {
		return result.data;
	}
	throw new ServerError('Server was unable to fulfill the request', result.status);
}

export {fetchQuestionsForExam, fetchQuestionsAndAnswersForExam, updateExam};
