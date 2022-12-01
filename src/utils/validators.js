

const validateNumber = (value, min, max) =>
{
	const num = Number(value);
	if (isNaN(num) || num < min || num > max)
		return false;
	else
		return true;
}

const validateDate = (value) =>
{
	if (!value || typeof value !== 'string')
		return false;
	const regExp = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}([zZ]|\.\d{1,3}[zZ])/;
	const match = value.match(regExp);
	return match ? true : false;
}

export {validateNumber, validateDate};
