
import '../App.css';

import {updateExam} from '../dataFunctions/examDataFunctions';
import { useEffect, useState } from 'react';

const EditExam = (props) => 
{
	console.log("EditExam");

	const [modifiedState, setModifiedState] = useState(modifiedStateFromProps(props));

	useEffect( () => {
		console.log("EditExam useEffect(...) first run");
	}, []);

	/*async function handleAddQuestionClicked(examId)
	{
		let addedQuestionData = undefined;
		try {
			addedQuestionData = await addNewQuestionToExam(examId);
			props.dispatch({type: 'NEW_QUESTION_ADDED_TO_EXAM', 
				payload: {examId: examId, questionData: addedQuestionData} });
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	async function handleRemoveQuestionClicked(questionId)
	{
		try {
			//Its ok to try to remove nonexixting question
			await removeQuestionFromExam(props.exam.id, questionId);
			props.dispatch({type: 'QUESTION_REMOVED_FROM_EXAM', payload: {examId: props.exam.id, questionId: questionId}});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}*/

	async function handleUpdateDataClicked()
	{
		try {
			if (!inputsValid())
				return;
			//NOTE Can't have a variable having the same name as a function const modifiedExam = modifiedExam();
			const editedExam = modifiedExam();
			await updateExam(editedExam);
			//Set modified property to false. When exam changed the component is recreated from scratch because
			//the component has id as a key
			setModifiedState({...modifiedState, modified: false});

			//TODO undefined props when tried to use function version of the state setter
			//Use function version of useSate to sync the local state with props
			//setModifiedState((state, props) => {return modifiedStateFromProps(props)});
		
			props.dispatch({type: 'EXAM_DATA_CHANGED', payload: editedExam});
		}
		catch (err) {
			props.dispatch({type: 'FAILED_TO_UPDATE_DATA', payload: err});
			return;
		}
	}

	function handleExamNameChanged(value)
	{
		setModifiedState({...modifiedState, modified: true, name: value});
	}

	function handleExamBeginChanged(value)
	{
		//If the date input is cleared the value is ''
		//Empty date is ok
		if (value === '' || dateValid(value)) {
			setModifiedState({...modifiedState, modified: true, invalidBeginDate: false, beginDate: value});
		}
		else {
			//If normal text box, date can be invalid
			setModifiedState({...modifiedState, modified: true, invalidBeginDate: true, beginDate: value});
		}
	}

	function handleExamBeginTimeChanged(value)
	{
		if (timeValid(value))
			setModifiedState({...modifiedState, modified: true, invalidBeginTime: false, beginTime: value});
		else
			setModifiedState({...modifiedState, modified: true, invalidBeginTime: true, beginTime: value});
	}

	function handleExamEndChanged(value)
	{
		setModifiedState({...modifiedState, modified: true, endDate: value});
	}

	function handleExamEndTimeChanged(value)
	{
		if (timeValid(value))
			setModifiedState({...modifiedState, modified: true, invalidEndTime: false, endTime: value});
		else
			setModifiedState({...modifiedState, modified: true, invalidEndTime: true, endTime: value});
	}

	function handleExamAvailableTimeChanged(value)
	{
		if (isPositiveNumber(value, 32768))
			setModifiedState({...modifiedState, modified: true, invalidAvailableTime: false, available_time: value});
		else
			setModifiedState({...modifiedState, modified: true, invalidAvailableTime: true, available_time: value});
	}

	function modifiedStateFromProps(currentProps)
	{
		return {modified: false, invalidBeginDate: false, invalidBeginTime: false,
			invalidEndDate: false, invalidEndTime: false, invalidAvailableTime: false,
			name: currentProps.exam.name, description: currentProps.exam.description,
			beginDate: dateStringFromIsoString(currentProps.exam.begin), beginTime: timeStringFromIsoString(currentProps.exam.begin),
			endDate: dateStringFromIsoString(currentProps.exam.end), endTime: timeStringFromIsoString(currentProps.exam.end),
			available_time: currentProps.exam.available_time};
	}

	/**
	 * Returns an exam object that is created using the current values in the input elements.
	 * Assumes that input elements have valid values.
	 * 
	 * Precondition: Foreach date dateValid(date)==true && foreach time timeValid(time)==true
	 * 
	 */
	function modifiedExam()
	{
		const examData = {};
		//Begin
		if (modifiedState.beginDate === '' || modifiedState.beginTime === '') {
			examData.begin = null;
		}
		else {
			//This component accepts also period as a separator
			const dateParts = modifiedState.beginDate.split(/[-.]/);
			const timeParts = modifiedState.beginTime.split(/[:.]/);
			let begin = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
			examData.begin = begin.toISOString();
		}
		//End
		if (modifiedState.endDate === '' || modifiedState.endTime === '') {
			examData.end = null;
		}
		else {
			//This component accepts also period as a separator
			const dateParts = modifiedState.endDate.split(/[-.]/);
			const timeParts = modifiedState.endTime.split(/[:.]/);
			let end = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
			examData.end = end.toISOString();
		}
		examData.available_time = modifiedState.available_time;
		examData.name = modifiedState.name;
		examData.description = modifiedState.description;
		examData.id = props.exam.id;
		return examData;
	 }

	function inputsValid()
	{
		return !(modifiedState.invalidBeginDate || modifiedState.invalidBeginTime || 
			modifiedState.invalidEndDate || modifiedState.invalidEndTime || modifiedState.invalidAvailableTime);
	}

	return (
		<div className='exam'>
			<h3>{props.exam.name}</h3>
			<div className='background-color-aqua'>
				<label htmlFor='name'>Nimi:</label>
				<input type='text' id='name' value={modifiedState.modified ? modifiedState.name : props.exam.name}
					onChange={(event) => handleExamNameChanged(event.target.value)}/>
				<label htmlFor='begin'>Alkuaika:</label>
				<input type='date' id='beginDate' className={modifiedState.invalidBeginDate ? 'invalid-input' : ''} value={modifiedState.modified ? modifiedState.beginDate : dateStringFromIsoString(props.exam.begin)}
					onChange={(event) => handleExamBeginChanged(event.target.value)}/>
				<input className={modifiedState.invalidBeginTime ? 'invalid-input' : ''} type='text' id='beginTime'
					value={modifiedState.modified ? modifiedState.beginTime : timeStringFromIsoString(props.exam.begin)}
					onChange={(event) => handleExamBeginTimeChanged(event.target.value)}/>
				<label htmlFor='end'>Loppuaika:</label>
				<input type='date' id='end' className={modifiedState.invalidEndDate ? 'invalid-input' : ''} value={modifiedState.modified ? modifiedState.endDate : dateStringFromIsoString(props.exam.end)}
						onChange={(event) => handleExamEndChanged(event.target.value)}/>
				<input type='text' id='endTime' className={modifiedState.invalidEndTime ? 'invalid-input' : ''} value={modifiedState.modified ? modifiedState.endTime : timeStringFromIsoString(props.exam.end)}
						onChange={(event) => handleExamEndTimeChanged(event.target.value)}/>
				<label htmlFor='availableTime'>Tekoaika (min):</label>
				<input type='text' id='availableTime' className={modifiedState.invalidAvailableTime ? 'invalid-input' : ''} value={modifiedState.modified ? modifiedState.available_time : props.exam.available_time}
						onChange={(event) => handleExamAvailableTimeChanged(event.target.value)}/>
				{modifiedState.modified && inputsValid() && <button type='button' onClick={() => handleUpdateDataClicked()}>Save</button>}
				{modifiedState.modified && !inputsValid() && <button type='button' disabled onClick={() => handleUpdateDataClicked()}>Save</button>}
			</div>
		</div>
	);
};

/**
 * Returns true if the value is [h]h:mm or [h]h.mm and hours and minutes 0 <= value < 60
 * Spaces allowed at begin and end.
 */
function timeValid(value)
{
	if (!value)
		return false;
	let match = value.match(/^\s*\d{1,2}[:.]\d{2}\s*$/);
	if (!match)
		return false;
	let parts =  match[0].split(/[:.]/);
	let hours = new Number(parts[0]);
	let minutes = new Number(parts[1]);
	return (hours >= 0 && hours < 60 && minutes >= 0 && minutes < 60);
}

/**
 * Returns true if the value is dddd-dd-dd or dddd.dd.dd, spaces allowed at begin and end
 *
 * TODO ranges
 */
function dateValid(value)
{
	if (!value)
		return false;
	return value.match(/^\s*\d{4}[-.]\d{2}[-.]\d{2}\s*$/);
}

/**
 * Return true if value is number and 0 <= value <= max
 * 
 * Pecondition: Number(max) !== NaN
 *  
 */
 function isPositiveNumber(value, max)
 {
	let result;
	 let num = Number(value);
	 //NOTE cant compare num === NaN, because only NaN === NaN, neither works ==
	 if (isNaN(num) || num > max || num < 0)
		 result = false;
	 else
		 result = true;
	return result;
 }

/**
 * Returns the date part of the date iso string
 * 
 * If the argument is undefined or null or doesn't contain dddd-dd-dd returns an empty string
 */
function dateStringFromIsoString(isoString)
{
	if (!isoString || typeof isoString !== 'string')
		return '';
	let match = isoString.match(/\d{4}-\d{2}-\d{2}/);
	return match ? match[0] : '';
}

/**
 * Returns the hours and minutes as a string 'dd:dd' in the local time zone.
 * 
 * If the argument is undefined or null or a date object can't be created using it as an argument
 * (The argument isn't iso 8601 date string) returns an empty string.
 */
function timeStringFromIsoString(isoString)
{
	if (!isoString || typeof isoString !== 'string')
		return '';
	//Convert the given date to the local time zone
	let localDate = new Date(isoString);
	if (!localDate || localDate.toString() === 'Invalid Date') {
		return '';
	}
	return paddedTimeComponent(localDate.getHours()) + ':' + paddedTimeComponent(localDate.getMinutes());
}

/**
 * If the argument < 10 pads with one zero.
 */
function paddedTimeComponent(timeComponent)
{
	if (timeComponent < 10)
		return '0' + timeComponent;
	return timeComponent;
}

export default EditExam;

/*
<div className='kysymys-lista'>
				{props.exam.questionDataArray.map( (item) => {
					return (
						<div key={item.id}>
							<EditQuestion
								questionId={item.id}
								dispatch={props.dispatch}
							/>
							<input type='button' value='-'
								onClick={(event) => handleRemoveQuestionClicked(item.id)}
							/>
						</div>
						)
					})
				}
			</div>
			<div>
				<input type='button' value='+'
					onClick={event => handleAddQuestionClicked(props.exam.id)}
				/>
			</div>
			*/