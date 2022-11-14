
class ServerError extends Error
{
	constructor(message, httpStatusCode)
	{
		super(message);
		this.httpStatusCode = httpStatusCode;
	}
}

export default ServerError;
