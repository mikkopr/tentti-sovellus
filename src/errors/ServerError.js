
class ServerError extends Error
{
	constructor(message, httpStatusCode)
	{
		super(message);
		this.name = 'ServerError';
		this.httpStatusCode = httpStatusCode;
	}
}

export default ServerError;
