const MainService = require('../../services/MainService');
//const reqResponse = require('../../cors/responseHandler');
//const { validationResult } = require('express-validator');
module.exports = {
	SendMain: async (req, res) => {
        var Time = await MainService.GetTime();
		res.send("TAddMag "+Time);
	},
}