const glob = require('glob');

//Adds all the routing that is required
module.exports = (app) => {
	glob(`${__dirname}/routes/**/*Routes.js`, {}, (er, files) => {
		if (er) throw er;
		files.forEach((file) => require(file)(app));
	});
};