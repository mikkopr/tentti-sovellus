
import axios from 'axios';

import * as axiosConfig from '../axiosConfig';

import ServerError from '../errors/ServerError';
import InvalidDataError from '../errors/InvalidDataError';
import BadRequestError from '../errors/BadRequestError'
import ConnectionError from '../errors/ConnectionError'
import {fetchAnswers} from './answerDataFunctions';


//TODO Sometimes data is returned and sometimes response!!!!!!!!!!!

const fetchExams = async () =>
{
	try {
		const config = axiosConfig.getConfig();
		const fetchResult = await axios.get('/tentit', axiosConfig.getConfig());
		return fetchResult;
	}
	catch (err) {
		throw err;
	}
}

/**
 * If includeQuestions==true includes also the questions and answers
 */
const fetchExam = async (examId, includeQuestions) =>
{
	try {
		let fetchResult;
		if (includeQuestions)
			fetchResult = await axios.get(`/tentit/${examId}?kysymykset=true`, axiosConfig.getConfig());
		else
		fetchResult = await axios.get(`/tentit/${examId}`, axiosConfig.getConfig());
		
		return fetchResult;
	}
	catch (err) {
		throw err;
	}
}

/**
 * Return exam assignment data for given user and exam
 */
const fetchExamAssignment = async (examId, userId) =>
{
	try {
		let fetchResult = await axios.get(`/tenttisuoritukset/kayttaja/${userId}/tentti/${examId}`, axiosConfig.getConfig());
		return fetchResult;
	}
	catch (err) {
		throw err;
	}
}

/**
 * Returns uncompleted exam assignments that are available now or in the future for given user.
 * 
 * @Param completed	If true returns only completed assignments
 * 
 * Returns {resultStatus: , data: }
 * 
 * Throws AxiosError
 */
 const fetchExamAssignments = async (userId, completed) =>
 {
	 try {
		let query = `/tenttisuoritukset/kayttaja/${userId}`;
		if (completed) {
			query += `?suoritetut=true`;
		}
		 let fetchResult = await axios.get(query, axiosConfig.getConfig());
		 return fetchResult.data;
	 }
	 catch (err) {
		 throw err;
	 }
 }

/**
 * Assigns user to the exam if not already assigned.
 * 
 * @return {resultStatus: success} if the user is assigned or was already assigned
 */
const assignUserToExam = async (examId, userId) =>
{
	try {
		let fetchResult = await axios.post(`/tenttisuoritukset/kayttaja/${userId}/tentti/${examId}`, {}, axiosConfig.getConfig());
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

const addExam = async () =>
{
	let fetchResult = undefined;
	try {
		const examStub = {name: 'Tentti', description: '', available_time: 0};
		fetchResult = await axios.post('/tentit/', examStub, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

const removeExam = async (examId) =>
{
	try {
		await axios.delete(`/tentit/${examId}`, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
}

const fetchQuestionAndAnswers = async (questionId) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.get(`/kysymykset/${questionId}/vastaukset?oikeat=true`, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	if (fetchResult.status === 200 && !Array.isArray(fetchResult.data)) {
		throw new InvalidDataError('Received invalid data');
	}
	if (fetchResult.data?.length == 0) {
		return undefined;
	}
	//TODO server should do this
	let question = {id: fetchResult.data[0].id, text: fetchResult.data[0].text, number: fetchResult.data[0].number, 
		points: fetchResult.data[0].points, answers: []};
	let result = fetchResult.data.reduce((acc, curr) => {
			if (curr.answer_id)
				acc.answers.push({id: curr.answer_id, text: curr.answer_text, correct: curr.answer_correct});
			return acc;
		}, question);
	return result;
}

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
 * Fetches the questions and associated question data without answers of the exam.
 * 
 * Return an array of questions.
 * Each question has properties: id, text, number, points
 */
const fetchQuestionsForExam = async (id) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.get('/tenttikysymykset/tentti/' + id, axiosConfig.getConfig());
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
		fetchResult = await axios.put('/tentit/' + exam.id, exam, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

const updateExamAssignment = async (examAssignment) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.put(`/tenttisuoritukset/kayttaja/${examAssignment.user_id}/tentti/${examAssignment.exam_id}`,
			examAssignment, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

/**
 * @return {resultStatus: success/failure, data: undefined}
 */
const deleteExamAssignment = async (examAssignment) =>
{
	try {
		let result = await axios.delete(
			`/tenttisuoritukset/kayttaja/${examAssignment.user_id}/tentti/${examAssignment.exam_id}`,
			axiosConfig.getConfig());
		return result.data;
	}
	catch (err) {
		throw err;
	}
}

/**
 * Returns the created question id, text, number and points if succesful.
 */
const addNewQuestionToExam = async (examId) =>
{
	let fetchResult = undefined;
	try {
		const questionStub = {text: 'kysymys', number: 1, points: 0};
		fetchResult = await axios.post(`/tenttikysymykset/tentti/${examId}/kysymys`, questionStub, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	return fetchResult.data;
}

/**
 * Returns true if the question was removed, false if the question wasn't found
 */
const removeQuestionFromExam = async (examId, questionId) =>
{
	let result = 0;
	try {
		result = await axios.delete(`/tenttikysymykset/tentti/${examId}/kysymys/${questionId}`, axiosConfig.getConfig());
	}
	catch (err) {
		throw err;
	}
	return result.data.deletedCount > 0 ? true : false;
}

const updateQuestion = async (questionId, text) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.put(`/kysymykset/${questionId}`, {text: text} , axiosConfig.getConfig());
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

const updateQuestionDataForExam = async (examId, questionId, number, points) =>
{
	let fetchResult = undefined;
	try {
		fetchResult = await axios.put(`/tenttikysymykset/tentti/${examId}/kysymys/${questionId}`, 
			{number: number, points: points} , axiosConfig.getConfig());
		return fetchResult.data;
	}
	catch (err) {
		throw err;
	}
}

export {fetchExams, fetchExam, fetchExamAssignment, fetchExamAssignments, assignUserToExam, addExam, removeExam,
	updateExamAssignment, deleteExamAssignment, fetchQuestionAndAnswers, fetchQuestionsForExam, fetchQuestionsAndAnswersForExam, updateExam, 
	addNewQuestionToExam, updateQuestion, updateQuestionDataForExam, removeQuestionFromExam};
