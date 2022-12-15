
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

export {dateStringFromIsoString, timeStringFromIsoString};
