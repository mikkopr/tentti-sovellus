
import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

import * as axiosConfig from '../axiosConfig';

import '../App.css';

import Navbar from '../Navbar'
import EditExam from './EditExam';
import Login from '../Login';
import Registration from '../Registration';
import ErrorMessage from '../ErrorMessage'
import QuestionList from './QuestionList';
import ExamList from './ExamList';
import Assignments from '../Assignments';
import ExamEvent from '../ExamEvent';

import * as examService from '../dataFunctions/examDataFunctions';
import * as messages from '../utils/messages';

const initialStateExamEvent = {
	examId: undefined, 
	exam: undefined, 
	examAssignment: undefined, 
	givenAnswers: undefined, //map, keys question ids. Values are sets of answer ids
	initializing: false, 
	underway: false, //TODO examAssignment.started
	saveRequested: false,
	saveRequired: false,
	failedToSave: false
};

const initialState = 
{
  user: {},
  exams: [], //Exams without questions and answers
	examAssignments: [],
	examList: [], //ExamList component shows exams in this list. The list is kept sync with exams list
	questionDataArray: undefined, //question data for selected exam, no answers
  selectedExamIndex: -1,
	examEvent: initialStateExamEvent,
  failedToSave: false,
  dataFetchRequired: true,
  loggedIn: false,
  loginRequested: false,
  failedToAuthenticate: false,
	showLogin: false,
	showRegister: false,
	showExamList: false,
	showError: false,
	showExamList: false,
	showExam: false,
	showAssignments: false,
	showCompletedAssignment: false, //Determines if completed assignments are shown when assignments are shown
	errorMessage: '',
	errorMessageTimeoutId: undefined
};

const assignmentStub = {exam_id: undefined, user_id: undefined, begin: undefined, answers: {answers:[]}, points: 0,
	available: true, completed: false, checked: false, approved: false, started: false };

//const STORAGE_KEY = 'examsData';

const ERROR_NAME_AXIOS_ERROR = 'AxiosError';
const ERROR_MESSAGE_TIMEOUT = 20000;
const ERROR_MESSAGE_FAILED_TO_FETCH = 'Tietojen lataus palvelimelta ep??onnistui';
const ERROR_MESSAGE_FAILED_TO_UPDATE = 'Tietojen tallennus palvelimelle ep??onnistui';

const AdminApp = () => 
{
  const [examsState, dispatch] = useReducer(reducer, initialState);
  //const [initialized, setInitialized] = useState(false);

  useEffect ( () =>
  {
    const fetchData = async () => {
      console.log("Fetching data");
      try {
				const result = await examService.fetchExams();
        dispatch({type: 'DATA_RECEIVED', payload: result.data});
      }
      catch (error) {
        console.log("Failed to fetch data");
        dispatch({type: 'FAILED_TO_FETCH_DATA', payload: error});
      }
    }
    if (examsState.dataFetchRequired && examsState.loggedIn) {
      fetchData();
    }
  }, [examsState.dataFetchRequired, examsState.loggedIn]);

  useEffect( () =>
  {
    const postData = async () =>
    {
      try {
        const result = await axios.post(SERVER + '/login', {email: examsState.user.name, password: examsState.user.password},
					axiosConfig.getConfig());
        dispatch({type: 'CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED', 
          payload: {status: result.status, data: result.data}});
      }
      catch (error) {
        dispatch({type: 'FAILED_TO_VERIFY_CREDENTIALS', payload: error})
      }
    }
    if (examsState.loginRequested && !examsState.loggedIn) {
      postData();
    }
  }, [examsState.loginRequested, examsState.loggedIn]);

	/**
	 * Fetches data for exam the event when an event begins
	 */
	useEffect ( () =>
  {
    const fetchData = async () => {
      console.log("Fetching data for exam event");
      try {
        const examResult = await examService.fetchExam(examsState.examEvent.examId, true);
				if (examResult.status == 204) {
					dispatch({type: 'EXAM_EVENT_FAILED_TO_FETCH_DATA', payload: new Error(`Exam not found for id=${examsState.examEvent.examId}`)});
					return;
				}
				const assignmentResult = await examService.fetchExamAssignment(examsState.examEvent.examId, examsState.user.userId);
				//Server's examAssignemntsHandler responds always 200, the body contains info about success or failure
				if (assignmentResult.data.resultStatus == 'failure') {
					//TODO resultCodes
					dispatch({type: 'EXAM_EVENT_FAILED_TO_FETCH_DATA', 
						payload: new Error(`EXAM_EVENT_FAILED_TO_FETCH_DATA examId=${examsState.examEvent.examId}. Message from server: ${assignmentResult.data.message}`)});
					return;
				}
        dispatch({type: 'EXAM_EVENT_DATA_RECEIVED', payload: {exam: examResult.data, examAssignment: assignmentResult.data.data}});
      }
      catch (error) {
        console.log("Failed to fetch data for exam event");
        dispatch({type: 'EXAM_EVENT_FAILED_TO_FETCH_DATA', payload: error});
      }
    }
    if (examsState.examEvent?.initializing) {
      fetchData();
    }
  }, [examsState.examEvent.initializing]);

	/**
	 * Saves exam event data
	 */
	useEffect ( () =>
  {
    const saveData = async () => {
      console.log("Saving exam event data");
      try {
        const result = await examService.updateExamAssignment(examsState.examEvent?.examAssignment);
				//Server's examAssignemntsHandler responds always 200, the body contains info about success or failure
				if (result.data.resultStatus == 'failure') {
					//TODO resultCodes
					dispatch({type: 'EXAM_EVENT_FAILED_TO_SAVE', 
						payload: new Error(`EXAM_EVENT_FAILED_TO_SAVE examId=${examsState.examEvent.examId}. Message from server: ${result.data.message}`)});
					return;
				}
        dispatch({type: 'EXAM_EVENT_DATA_SAVED', payload: result.data});
      }
      catch (error) {
        dispatch({type: 'EXAM_EVENT_FAILED_TO_SAVE', payload: error});
      }
    }
    if (examsState.examEvent?.saveRequested && examsState.examEvent?.saveRequired) {
      saveData();
    }
  }, [examsState.examEvent.saveRequested, examsState.examEvent.saveRequired]);


	/************************************************
	 * Event handlers
	 */
	
	//TODO try to use reducer instead

	async function handleShowExamListClicked()
	{
		console.log('handleShowExamListClicked()');
		try {
			let result = await examService.fetchExamAssignments(examsState.user.userId, false);
			dispatch({type: 'SHOW_EXAM_LIST_REQUESTED', payload: {assignments: result.data}});
		}
		catch (err) {
			dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
		}
	}

	/**
	 * @param showCompleted If true shows only completed assignments
	 */
	async function handleShowAssignmentsClicked(showCompletedAssignments)
	{
		try {
			let result = await examService.fetchExamAssignments(examsState.user.userId, showCompletedAssignments);
			dispatch({type: 'SHOW_ASSIGNMENTS_REQUESTED', payload: {assignments: result.data, showCompletedAssignments: showCompletedAssignments}});
		}
		catch (err) {
			dispatch({type: 'FAILED_TO_FETCH_DATA', payload: err});
		}
	}
	

	/************************************************
	 * Event handlers for reducer
	 */

	/* Exam list */

	/**
	 * Executed when exam list is opened. Note that state.examAssignments is updated.
	 */
	function handleShowExamListRequested(state, payload)
	{
		return {...state, examList: [...state.exams], examAssignments: [...payload.assignments], selectedExamIndex: -1, 
			showExamList: true, showExam: false, showAssignments: false};
	}

	/**
	 * Executed when exam list is visible and user request to show all exams
	 */
	function handleShowAllExamsRequested(state)
	{
		//TODO shows also exams that have null dates
		return {...state, examList: [...state.exams], selectedExamIndex: -1, 
			showExamList: true, showExam: false, showAssignments: false};
	}

	function handleShowOngoingExamsRequested(state, payload)
	{
		//Add the references of ongoing exams to state.examList.
		//Its assumed that system's clock is correct
		const currTimeMs = new Date().getTime();
		const modifiedExamList = state.exams.reduce( (acc, exam) => {
				if (!exam || !exam.begin || !exam.end) {
					return acc;
				}
				const beginTimeMs = new Date(exam.begin).getTime();
				const endTimeMs = new Date(exam.end).getTime();
				if (currTimeMs >= beginTimeMs && currTimeMs < endTimeMs) {
					acc.push(exam);
				}
				return acc;
			}, []);
			return {...state, examList: modifiedExamList};
	}

	function handleShowIncomingExamsRequested(state, payload)
	{
		//Add the references of incoming exams to state.examList.
		//Its assumed that system's clock is correct
		const currTimeMs = new Date().getTime();
		const modifiedExamList = state.exams.reduce( (acc, exam) => {
				if (!exam || !exam.begin || !exam.end) {
					return acc;
				}
				const beginTimeMs = new Date(exam.begin).getTime();
				const endTimeMs = new Date(exam.end).getTime();
				if (currTimeMs < beginTimeMs) {
					acc.push(exam);
				}
				return acc;
			}, []);
			return {...state, examList: modifiedExamList};
	}

	function handleShowPastExamsRequested(state, payload)
	{
		//Add the references of incoming exams to state.examList.
		//Its assumed that system's clock is correct
		const currTimeMs = new Date().getTime();
		const modifiedExamList = state.exams.reduce( (acc, exam) => {
				if (!exam || !exam.begin || !exam.end) {
					return acc;
				}
				const beginTimeMs = new Date(exam.begin).getTime();
				const endTimeMs = new Date(exam.end).getTime();
				if (currTimeMs < beginTimeMs) {
					acc.push(exam);
				}
				return acc;
			}, []);
			return {...state, examList: modifiedExamList};
	}

	function handleUserAssignedToExam(state, payload)
	{
		const assignment = {...assignmentStub, user_id: payload.userId, exam_id: payload.examId};
		return {...state, examAssignments: [...state.examAssignments, assignment]};
	}

	function handleAssignmentCanceled(state, payload)
	{
		const assignmentIndex = state.examAssignments.findIndex(item => item.exam_id === payload.assignment.exam_id);
		const modifiedAssignments = state.examAssignments.slice(0, assignmentIndex).concat(state.examAssignments.slice(assignmentIndex + 1, -1));
		return {...state, examAssignments: modifiedAssignments};
	}

	function handleActiveExamChanged(state, payload)
	{
		console.log('handleActiveExamChanged(...)');
		const stateCopy = {...state, exams: [...state.exams], showExamList: false, showExam: true, showAssignments: false};
		const examId = payload.examId;
		stateCopy.selectedExamIndex = stateCopy.exams.findIndex( (item) => item.id == examId );
		stateCopy.questionDataArray = [...payload.questionDataArray];
		return stateCopy;
	}

	function handleExamAdded(state, payload)
	{
		//TODO Should make copy of the exam in payload?
		const stateCopy = {...state, exams: [...state.exams], examList: [...state.examList]};
		stateCopy.exams.push(payload);
		//If the exam list is shown, update the state.examList too
		if (state.showExamList) {
			stateCopy.examList.push(payload);
		}
		return stateCopy;
	}

	function handleExamRemoved(state, payload)
	{
		const stateCopy = {...state};
		const removedIndex = stateCopy.exams.findIndex((item) => item.id === payload.examId);
		stateCopy.exams = stateCopy.exams.slice(0, removedIndex).concat(stateCopy.exams.slice(removedIndex + 1, -1));
		//If the exam list is shown, update the state.examList too
		if (state.showExamList) {
			const examListIndex = stateCopy.examList.findIndex( (item) => item.id === payload.examId );
			stateCopy.examList = stateCopy.examList.slice(0, examListIndex).concat(stateCopy.examList.slice(examListIndex + 1, -1));
		}
		return stateCopy;
	}

	function handleExamDataChanged(state, payload)
	{
		console.log('handleExamDataChanged(...)');
		const stateCopy = {...state, exams: [...state.exams]};
		let examIndex;
		//If an exam is modified in the list, nothing is selected, so have to search
		if (stateCopy.selectedExamIndex > -1) {
			examIndex = stateCopy.selectedExamIndex;
		}
		else {
			examIndex = stateCopy.exams.findIndex( (item) => item.id == payload.id );
		}
		const modifiedExam = {...stateCopy.exams[examIndex], name: payload.name, description: payload.description,
			begin: payload.begin, end: payload.end, available_time: payload.available_time};
		stateCopy.exams[examIndex] = modifiedExam;
		//If the exam list is shown, update the state.examList too
		if (state.showExamList) {
			const examListIndex = stateCopy.examList.findIndex( (item) => item.id == payload.id );
			stateCopy.examList[examListIndex] = modifiedExam;
		}
		return stateCopy;
	}

	function handleNewQuestionAddedToExam(state, payload)
	{
		console.log('handleNewQuestionAddedToExam(...)');
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]}; //TODO neccessary to copy exams array?
		stateCopy.questionDataArray = [...stateCopy.questionDataArray];
    stateCopy.questionDataArray.push(
			{id: payload.questionData.id, text: payload.questionData.text ,number: payload.questionData.number,
				points: payload.questionData.points});
		return stateCopy;
	}

	function handleQuestionRemovedFromExam(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray = stateCopy.questionDataArray.slice(0, questionIndex).concat(
			stateCopy.questionDataArray.slice(questionIndex + 1, stateCopy.questionDataArray.length));
		return stateCopy;
	}

	function handlequestionNumberChanged(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray[questionIndex].number = payload.number;
		return stateCopy;
	}

	function handlequestionPointsChanged(state, payload)
	{
		const stateCopy = {...state, exams: [...state.exams], questionDataArray: [...state.questionDataArray]};
		const questionIndex = stateCopy.questionDataArray.findIndex( (item => item.id == payload.questionId) );
		stateCopy.questionDataArray[questionIndex].points = payload.points;
		return stateCopy;
	}

	function handleOperationNotPermitted(state, payload)
	{
		//Start timeout for error message closing
		clearTimeout(state.errorMessageTimeoutId);
		const timeoutId = setTimeout(() => {
			dispatch({type: 'HIDE_ERROR_REQUESTED'});
		}, ERROR_MESSAGE_TIMEOUT);
		return {...state, showError: true, errorMessage: messages.messageForResponseCode(payload.responseCode)};
	}

	function handleFailedToFetchData(state, payload)
	{
		const errorMessageToUser = ERROR_MESSAGE_FAILED_TO_FETCH + '. ' + errorMessageForError(payload);
		//alert(errorMessageToUser); //TODO remove
		//Start timeout for error message closing
		clearTimeout(state.errorMessageTimeoutId);
		const timeoutId = setTimeout(() => {
			dispatch({type: 'HIDE_ERROR_REQUESTED'});
		}, ERROR_MESSAGE_TIMEOUT);
		return {...state, failedToFetch: true, showError: true, errorMessage: errorMessageToUser, errorMessageTimeoutId: timeoutId};
	}

	function handleFailedToUpdateData(state, payload)
	{
		const errorMessageToUser = ERROR_MESSAGE_FAILED_TO_UPDATE + '. ' + errorMessageForError(payload);
		//alert(errorMessageToUser); //TODO remove
		//Start timeout for error message closing
		clearTimeout(state.errorMessageTimeoutId);
		const timeoutId = setTimeout(() => {
			dispatch({type: 'HIDE_ERROR_REQUESTED'});
		}, ERROR_MESSAGE_TIMEOUT);
		return {...state, failedToSave: true, showError: true, errorMessage: errorMessageToUser, errorMessageTimeoutId: timeoutId};
	}
	
	/**
		* Event handlers for exam event
		*/
	
	function handleExamEventBeginRequested(state, payload)
	{
		return {...state, examEvent: {...initialStateExamEvent, examId: payload.examId, initializing: true},
			showExamList: false, showExam: false, showError: false, errorMessage: ''};
	}

	function handleExamEventDataReceived(state, payload)
	{
		const givenAnswers = answersMapFromAnswersArray(payload.examAssignment.answers.answers);
		const examEvent = {...state.examEvent, exam: payload.exam, examAssignment: {...payload.examAssignment, started: true}, 
			givenAnswers: givenAnswers, initializing: false, underway: true};
		examEvent.exam.questions.sort((a, b) => a.number - b.number);
		return {...state, examEvent: examEvent, showError: false};
	}

	function handleExamEventAnswerChanged(state, payload)
	{
		const givenAnswers = state.examEvent.givenAnswers;
		let answersForQuestion = givenAnswers.get(payload.questionId);
		//Add entry for the answer if the answer is checked, otherwise update
		if (!answersForQuestion) {
			if (payload.checked)
				givenAnswers.set(payload.questionId, new Set([payload.answerId]));
		}
		else {
			if (payload.checked)
				answersForQuestion.add(payload.answerId);
			else
				answersForQuestion.delete(payload.answerId);
		}
		const nextState = {...state, examEvent: {...state.examEvent, exam: {...state.examEvent.exam}, saveRequired: true}};
		const questionIndex = state.examEvent.exam.questions.findIndex(item => item.id === payload.questionId);
		const answerIndex = state.examEvent.exam.questions[questionIndex].answers.findIndex(item => item.id === payload.answerId);
		nextState.examEvent.exam.questions = [...state.examEvent.exam.questions];
		nextState.examEvent.exam.questions[questionIndex].answers = [...state.examEvent.exam.questions[questionIndex].answers];
		nextState.examEvent.exam.questions[questionIndex].answers[answerIndex] = {...state.examEvent.exam.questions[questionIndex].answers[answerIndex]};
		return nextState;
	}

	/**
	 * Request save by setting saveRequested as true, if save is required.
	 * If force=true saveRequested and saveRequired are set true
	 */
	function handleExamEventSaveData(state, force)
	{
		//Don't save if not required
		if (!force && !state.examEvent.saveRequired) {
			return {...state};
		}
		const givenAnswersArr = answersArrayFromAnswersMap(state.examEvent.givenAnswers);
		return {...state,
			examEvent: {...state.examEvent, saveRequested: true, saveRequired: true, failedToSave: false,
				examAssignment: {...state.examEvent.examAssignment, answers: {answers: givenAnswersArr}}
			}
			, showError: false, errorMessage: ''};

		/*"answers": {
		"answers": [
			{"questionId": 15, "answerIds": [9,29]},
			{"questionId": 16, "answerIds": [11]} ]},*/
	}

	function handleExamEventDataSaved(state, payload)
	{
		const receivedAssignment = payload;
		const modifiedAssignment = {...state.examEvent.examAssignment, completed: receivedAssignment.completed,
			checked: receivedAssignment.checked, points: receivedAssignment.points};
		return {...state, showError: false, errorMessage: '',
				examEvent: {...state.examEvent, examAssignment: modifiedAssignment, saveRequested: false, saveRequired: false,
					failedToSave: false}
			};
	}

	function handleExamEventFinishRequested(state)
	{
		//Request save and set state to completed
		const nextState = handleExamEventSaveData(state, true);
		nextState.examEvent.examAssignment.completed = true;
		return nextState;
	}

	function handleExamEventFailedToFetchData(state, payload)
	{
		const errorMessageToUser = errorMessageForError(payload);
		//TODO
		return {...state, examEvent: {...initialStateExamEvent}, showError: true, errorMessage: errorMessageToUser};
	}

	function handleExamEventFailedToSave(state, payload)
	{
		const errorMessageToUser = errorMessageForError(payload);
		return {...state, examEvent: {...state.examEvent, saveRequested: false}, showError: true, errorMessage: errorMessageToUser};
	}

	/***************************************************
	 * Reducer
	 */

  function reducer(state, action)
  {
    let stateCopy = {...state, exams: [...state.exams]};
    
    switch (action.type) 
		{ 
			case 'EXAM_LIST_SHOW_ONGOING':
				console.log('EXAM_LIST_SHOW_ONGOING');
				return handleShowOngoingExamsRequested(state, action.payload);

			case 'EXAM_LIST_SHOW_INCOMING':
				console.log('EXAM_LIST_SHOW_INCOMING');
				return handleShowIncomingExamsRequested(state);

			case 'EXAM_LIST_SHOW_PAST':
				console.log('EXAM_LIST_SHOW_PAST');
				return handleShowPastExamsRequested(state);

			case 'EXAM_LIST_SHOW_ALL':
				console.log('EXAM_LIST_SHOW_ALL');
				return handleShowAllExamsRequested(state);

			case 'USER_ASSIGNED_TO_EXAM':
				console.log('USER_ASSIGNED_TO_EXAM');
				return handleUserAssignedToExam(state, action.payload);

			case 'ASSIGNMENT_CANCELED':
				console.log('ASSIGNMENT_CANCELED');
				return handleAssignmentCanceled(state, action.payload);

			case 'ACTIVE_EXAM_CHANGED':
				console.log('ACTIVE_EXAM_CHANGED');
				return handleActiveExamChanged(state, action.payload);

			case 'EXAM_ADDED':
				console.log('EXAM_ADDED');
				return handleExamAdded(state, action.payload);
			
			case 'EXAM_REMOVED':
				console.log('EXAM_REMOVED');
				return handleExamRemoved(state, action.payload);

			case 'EXAM_DATA_CHANGED':
				console.log('EXAM_DATA_CHANGED');
				return handleExamDataChanged(state, action.payload);

			case 'NEW_QUESTION_ADDED_TO_EXAM':
				console.log('NEW_QUESTION_ADDED_TO_EXAM');
				return handleNewQuestionAddedToExam(state, action.payload);

			case 'QUESTION_REMOVED_FROM_EXAM':
				console.log('QUESTION_REMOVED_FROM_EXAM');
				return handleQuestionRemovedFromExam(state, action.payload);

			case 'QUESTION_NUMBER_CHANGED':
				console.log('QUESTION_NUMBER_CHANGED');
				return handlequestionNumberChanged(state, action.payload);
			
			case 'QUESTION_POINTS_CHANGED':
				console.log('QUESTION_POINTS_CHANGED');
				return handlequestionPointsChanged(state, action.payload)

      case 'DATA_RECEIVED':
      {
        console.log('DATA_RECEIVED');
        stateCopy.exams = action.payload;
        stateCopy.dataFetchRequired = false;
        stateCopy.failedToFetch = false;
        stateCopy.isSaveRequired = false;
        stateCopy.failedToSave = false;
        stateCopy.selectedExamIndex = -1;
        stateCopy.user = {...state.user};
        stateCopy.loggedIn = true;
				stateCopy.showExamList = false;
        return stateCopy;
      }

			case 'OPERATION_NOT_PERMITTED':
				console.log('OPERATION_NOT_PERMITTED');
				return handleOperationNotPermitted(state, action.payload);

      case 'FAILED_TO_FETCH_DATA':
        console.log('FAILED_TO_FETCH_DATA: ' + action.payload.message);
				return handleFailedToFetchData(state, action.payload);
			
			case 'FAILED_TO_UPDATE_DATA':
				console.log('FAILED_TO_UPDATE_DATA ', action.payload.message);
				return handleFailedToUpdateData(state, action.payload);

			case 'USER_CREDENTIALS_RECEIVED':
      {
        console.log('USER_CREDENTIALS_RECEIVED');
        const user = {name: action.payload.username, password: action.payload.password};
        return {...state, user: user, loggedIn: false, loginRequested: true, 
        	isSaveRequired: false, failedToSave: false, showLogin: false};
      }
      case 'CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED':
      {
        console.log('CREDENTIALS_VERIFICATION_RESPONSE_RECEIVED');
        const responseStatus = action.payload.status;
        const userId = action.payload.data.userId;
				const email = action.payload.data.email;
				const role = action.payload.data.role;
				const token = action.payload.data.token;
        if (responseStatus == 200) {
					axiosConfig.setToken(token);
          return {...state, user: {userId: userId, email: email, role: role, admin: (role === 'admin'), token: token}, loggedIn: true, 
						loginRequested: false, dataFetchRequired: true, showError: false};
        }
				/*else if (responseStatus == 403 || responseStatus == 401) //TODO status?
					return {...state, user: {...state.user}, loggedIn: false, loginRequested: false, failedToAuthenticate: true,
						showError: true, errorMessage: 'K??ytt??j??tunnus tai salasana v????r??'};
				else*/
					return {...state, user: {...state.user}, loggedIn: false, loginRequested: false, failedToAuthenticate: true,
						showError: true, errorMessage: 'T??llaista ei pit??isi tapahtua'};
      }
      case 'FAILED_TO_VERIFY_CREDENTIALS':
        console.log('FAILED_TO_VERIFY_CREDENTIALS');
				if (action.payload.response?.status == 401)
					return {...state, user: {...state.user}, loggedIn: false, failedToAuthenticate: true, 
						showLogin: true, loginRequested: false, showError: true, errorMessage: 'K??ytt??j??tunnus tai salasana v????r??'};
				else {
					console.log('Login failed: ' + action.payload.response?.error?.message);
					const message = 'Kirjautuminen ep??onnistui, sovelluksessa virhetilanne';
	        return {...state, user: {...state.user}, loggedIn: false, failedToAuthenticate: true,
						showLogin: true, loginRequested: false, showError: true, errorMessage: message};
				}
      
			case 'LOG_OUT_REQUESTED':
        console.log('LOG_OUT_REQUESTED');
        return {...state, user: {}, loggedIn: false, notAuthorized: false, showError: false};
      
			case 'SHOW_LOGIN_REQUESTED':
				console.log('SHOW_LOGIN_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: true, showRegister: false, showError: false};
			
			case 'SHOW_REGISTRATION_REQUESTED':
				console.log('SHOW_REGISTRATION_REQUESTED');
				return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, showError: false};

			case 'SHOW_EXAM_LIST_REQUESTED':
				console.log('SHOW_EXAM_LIST_REQUESTED');
				return handleShowExamListRequested(state, action.payload);
			
			case 'SHOW_ASSIGNMENTS_REQUESTED':
				console.log('SHOW_ASSIGNMENTS_REQUESTED');
				return {...state, examAssignments: action.payload.assignments, showAssignments: true, showCompletedAssignments: action.payload.showCompletedAssignments, 
					selectedExamIndex: -1, showExam: false, showExamList: false, showError: false, errorMessage: ''};

			case 'REGISTRATION_COMPLETED':
				console.log('REGISTRATION_COMPLETED');
				const userId = action.payload.data.userId;
				const email = action.payload.data.email;
				const role = action.payload.data.role;
				const token = action.payload.data.token;
				axiosConfig.setToken(token);
				return {...state, user: {userId: userId, email: email, role: role, token: token}, loggedIn: true, 
						loginRequested: false, dataFetchRequired: true, showLogin: false, showRegister: false,
						showError: false, duplicateEmail: false};
			
			case 'REGISTRATION_FAILED':
			{
				console.log('REGISTRATION_FAILED');
				console.log(action.payload.error?.message);
				if (action.payload.status == 409) {
					console.log('duplicate email');
					return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, duplicateEmail: true};
				}
				else {
					return {...state, user: {}, loggedIn: false, showLogin: false, showRegister: true, duplicateEmail: false, 
						showError: true, errorMessage: 'REGISTRATION_FAILED'};
				}

			}
			case 'HIDE_ERROR_REQUESTED':
				if (state.errorMessageTimeoutId)
					clearTimeout(state.errorMessageTimeoutId);
				return {...state, showError: false, errorMessage: '', errorMessageTimeoutId: undefined};
			
			/**
			 * Exam event
			 */

			case 'EXAM_EVENT_BEGIN_REQUESTED':
				console.log('EXAM_EVENT_BEGIN_REQUESTED');
				return handleExamEventBeginRequested(state, action.payload);

			case 'EXAM_EVENT_DATA_RECEIVED':
				console.log('EXAM_EVENT_DATA_RECEIVED');
				return handleExamEventDataReceived(state, action.payload);
		
			case 'EXAM_EVENT_DATA_SAVED':
				console.log('EXAM_EVENT_DATA_SAVED');
				return handleExamEventDataSaved(state, action.payload);

			case 'EXAM_EVENT_ANSWER_CHANGED':
				console.log('EXAM_EVENT_ANSWER_CHANGED');
				return handleExamEventAnswerChanged(state, action.payload);

			case 'EXAM_EVENT_SAVE_CLICKED':
				console.log('EXAM_EVENT_SAVE_CLICKED');
				return handleExamEventSaveData(state);

			case 'EXAM_EVENT_FINISH_CLICKED':
				console.log('EXAM_EVENT_FINISH_CLICKED');
				return handleExamEventFinishRequested(state);
			
			case 'EXAM_EVENT_FAILED_TO_FETCH_DATA':
				console.log('EXAM_EVENT_FAILED_TO_FETCH_DATA');
				return handleExamEventFailedToFetchData(state, action.payload);

			case 'EXAM_EVENT_FAILED_TO_SAVE':
				console.log('EXAM_EVENT_FAILED_TO_SAVE');
				return handleExamEventFailedToSave(state, action.payload);

			default:
        throw Error('Unknown event: ' + action.type);
    }
  }

  return (
    <div className='App'>
      <Navbar loggedIn={examsState.loggedIn} admin={examsState.user?.admin} dispatch={dispatch} 
				handleShowExamListClicked={handleShowExamListClicked} handleShowAssignmentsClicked={handleShowAssignmentsClicked}/>

			{examsState.showError && <ErrorMessage message={examsState.errorMessage} dispatch={dispatch}/>}

			{!examsState.loggedIn && examsState.loginRequested && <p>Kirjaudutaan...</p>}
			
			{examsState.showRegister && <Registration dispatch={dispatch} duplicate={examsState.duplicateEmail}/>}
			{examsState.showLogin && <Login dispatch={dispatch}/>}

      {examsState.loggedIn && examsState.showExamList && 
				<ExamList exams={examsState.examList} examAssignments={examsState.examAssignments} admin={examsState.user?.admin} userId={examsState.user.userId} dispatch={dispatch} 
					handleShowExamListClicked={handleShowExamListClicked}/>}
      
			{examsState.loggedIn && examsState.showAssignments &&
				<Assignments assignments={examsState.examAssignments} exams={examsState.exams} showCompleted={examsState.showCompletedAssignments} dispatch={dispatch}/>}

			{examsState.loggedIn && examsState.showExam && examsState.selectedExamIndex !== -1 && 
				<>
					<EditExam key={examsState.exams[examsState.selectedExamIndex].id} 
						exam={examsState.exams[examsState.selectedExamIndex]} dispatch={dispatch}/>
					<QuestionList examId={examsState.exams[examsState.selectedExamIndex].id} 
						questionDataArray={examsState.questionDataArray} dispatch={dispatch}/>
				</>}
			
			{examsState.loggedIn && examsState.examEvent.underway && <ExamEvent examEvent={examsState.examEvent} dispatch={dispatch}/>}
      
    </div>
    )
}

function answersMapFromAnswersArray(answersArray)
{
	const initial = new Map();
	const result = answersArray.reduce((map, curr) => {
			const answers = new Set();
			curr.answerIds.forEach(item => answers.add(item));
			map.set(curr.questionId, answers);
			return map;
		}, initial);
	return result;
	/*"answers": {
		"answers": [
			{"questionId": 15, "answerIds": [9,29]},
			{"questionId": 16, "answerIds": [11]} ]},*/
}

function answersArrayFromAnswersMap(answersMap)
{
	if (!answersMap) {
		return [];
	}
	const result = [];
	for (let questionId of answersMap.keys()) {
		let answerIds = answersMap.get(questionId);
		result.push({questionId: questionId, answerIds: Array.from(answerIds.values())});
	}
	return result;
}

function errorMessageForError(error)
{
	let statusCode;
	let responseData;
	let errorMessageToUser = '';
	if (error.name === ERROR_NAME_AXIOS_ERROR) {
		if (error.code === 'ECONNABORTED') {
			errorMessageToUser += 'Palvelimelta ei saatu vastausta. ';
		}
		else {
			statusCode = error.response?.status;
			responseData = error.response?.data;
		}
	}
	//Also client may throw an error, E.g when received status 200 but failure
	else {
		statusCode = null;
		errorMessageToUser += error.message;
	}
	if (statusCode)
		errorMessageToUser += errorMessageForResponseStatus(statusCode, responseData);
	
	return errorMessageToUser;
}

function errorMessageForResponseStatus(statusCode, responseData)
{
	let errorMessage = '';
	switch (statusCode)
	{
		case 401:
			errorMessage = 'Et ole kirjautunut sis????n. Toimenpide vaatii sis????nkirjautumisen.';
			break;
		case 403:
			errorMessage = 'Sinulla ei ole vaadittavaa k??ytt??oikeutta.';
			break;
		case 400:
			errorMessage = 'Palvelimelle l??hetetty virheellist?? tietoa.';
			break;
		case 404:
			errorMessage = errorMessageForResponseNotFound(responseData);
			break;
		case 409:
			errorMessage = 'On jo olemassa'; //TODO Modify server to send 200 and failure instead (or 500 because not user faiure)
			break;
		case 500:
			errorMessage = 'Palvelimella virhetila.';
			break;
		default:
			errorMessage = 'Sovelluksessa virhetila.';
	}
	return errorMessage;
}

/**
 * Return error message for response status 404
 */
function errorMessageForResponseNotFound(responseData)
{
	//TODO Modify server to send not found (and 409) in the database using status 200 (examAssignmentsHandler.js)
	//Then the following isn't needed
	if (responseData.sender === 'Application')
		return 'Toimenpiteeseen vaadittavaa tietoa ei l??ydy palvelimelta. ' + responseData.message;
	else
		return 'Pyynt?? ei mennyt perille oikeaan paikkaan.';
}

export default AdminApp;

//{examsState.loggedIn && !examsState.dataFetchRequired && <ExamMenu exams={examsState.exams} onExamSelected={handleExamSelected}/>}
//{examsState.loggedIn && examsState.failedToFetch && <p>Tietojen nouto palvelimelta ep??onnistui</p>}
//{examsState.loggedIn && examsState.failedToSave && <p>Tietojen tallennus palvelimelle ep??onnistui</p>}
//{examsState.loggedIn && examsState.notAuthorized && <p>Ei valtuuksia</p>}

//{examsState.loggedIn && examsState.selectedExamIndex !== -1 && examsState.showExam && 
//<QuestionList examId={examsState.exams[examsState.selectedExamIndex].id} questionDataArray={examsState.questionDataArray} dispatch={dispatch}/>}

//{examsState.loggedIn && <Toolbar showExamTools={examsState.showExam} showExamListTools={examsState.showExamList} admin={examsState.user?.admin} dispatch={dispatch}/>}