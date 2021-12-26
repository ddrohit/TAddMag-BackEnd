// 4XX status code related to client side error
// 5XX status code related to server side error

const getErrorStatus = require('../constant/ErrorData');

function findErrorMessage(status) {
	return getErrorStatus.ERROR_STATUS_ARRAY.find(v => v.status == status) || { error: 'There must be an error' };
}

let successResponse = (status, succMessage, data) => {
	return {
		status,
		message: succMessage,
		data
	}
}

let errorResponse = (statusCode,failmessage,data) => {
	if(statusCode == 422)
	{
		return {
			message:failmessage,
			data
		}
	}

	if(statusCode == 500)
	{
		return {
			message:failmessage,
			data
		}
	}

	return findErrorMessage(statusCode);
}


module.exports = {
	errorResponse,
	successResponse,
};