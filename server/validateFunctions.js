
const validateReqParamId = (value) =>
{
  const regExp = /^\d+$/;
  const match = value.match(regExp);
  return (match != null) ? value : undefined;
}

/*const validateQueryValueString = (value) => 
{
  if (value === undefined || value.length > 200) {
    return undefined;
  }
  return value;
}

const validateQueryValueDateString = (value) => 
{
  if (value === undefined || value.length > 200) {
    return undefined;
  }
  //still accepts invalid month and day values
  const regExpDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}&/;
  const matches = value.match(regExpDate);
  return (matches != null && matches.length == 1) ? value : undefined;
}

const validateQueryValueNumber = (value, min, max) =>
{
  if (value === undefined) {
    return undefined;
  }
  const regExp = /^\d+$/;
  const match = value.match(regExp);
  if (match == null) {
    return undefined;
  }
  const num = new Number(value);
  return (num >= min && num <= max) ? value : undefined;
}*/

module.exports = {validateReqParamId};
