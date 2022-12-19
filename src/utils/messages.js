
const {resultCodes} = require('../../src/resultCodes.js');

function messageForResponseCode(code)
{
	switch (code)
	{
		case resultCodes().dataNotFound:
			return 'Toimenpiteeseen tarvittavaa tietoa ei löydy.';
		case resultCodes().examNotStarted:
			return 'Tentti ei ole alkanut.'
		case resultCodes().examCompleted:
			return 'Tentti on päättynyt.';
		case resultCodes().examAvailableTimeEnded:
			return 'Suoritusaika on päättynyt';
		case resultCodes().assignmentToExamNotAllowed:
			return 'Tenttiin ei voi ilmoittautua.';
		case resultCodes().notAllowedToDeleteAssignment:
			return 'Ilmoittautumista ei voi perua.'
		default:
			return 'Toimenpidettä ei voitu suorittaa. Koodi: ' + code;
	}
}

export {messageForResponseCode};
