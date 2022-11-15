
import axios from 'axios';

import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';
import BadRequestError from '../errors/BadRequestError'
import ConnectionError from '../errors/ConnectionError'
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
		throw err;
	}
	if (fetchResult.status === 200 && !Array.isArray(fetchResult.data)) {
		throw new InvalidDataError('Received invalid data');
	}
	return fetchResult.data;
}

const updateExam = async (exam) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.put('http://localhost:8080/tentit/' + exam.id);
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

const addNewQuestionToExam = async (examId) =>
{
	let fetchResult = undefined;
	try {
		const questionStub = {teksti: 'kysymys', kysymys_numero: 1, pisteet: 0};
		fetchResult = await axios.post(`http://localhost:8080/tenttikysymykset/tentti/${examId}/kysymys`, questionStub);
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

/*const addNewQuestionToExam = async (examId) =>
{
	let fetchResult = undefined;
	try {
		const questionStub = {teksti: 'kysymys', kysymys_numero: 1, pisteet: 0};
		fetchResult = await axios.post(`http://localhost:8080/tenttikysymykset/tentti/${examId}/kysymys`, questionStub);
	}
	catch (err) {
		if (!err.request) {
			throw new Error('ERROR: Failed to make a request!');
		}
		if (!err.response) {
			throw new ConnectionError('ERROR: No response received!');
		}
		if (err.response.status === 400) {
			throw new BadRequestError(err.message);
		}
		throw new ServerError(err.message , err.response.status);
	}
	if (fetchResult.status === 200 || fetchResult.status === 204) {
		return fetchResult.data;
	}
	throw new ServerError('Server was unable to fulfill the request', fetchResult.status);
}*/

export {fetchQuestionsForExam, fetchQuestionsAndAnswersForExam, updateExam, addNewQuestionToExam};
