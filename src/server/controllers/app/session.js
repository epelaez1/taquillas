const env = process.env.NODE_ENV || 'development';
const got = require('got');
const xml2js = require('xml2js');
const xmlProcessors = require('xml2js/lib/processors');
const { UnauthorizedError } = require('../../errors');
const config = require('../../config/server.json')[env];
const models = require('../../models');


const login = (req, res) => {
	// Compose the backend URL that should handle the redirect after
	// a successful login (/login?redirect={window.location.href}).
	const callbackUrl = new URL(`${config.url}/api/v1/app/session/new`);
	callbackUrl.searchParams.set('redirect', req.query.redirect);

	// Insert the callback URL as the service.
	const ssoRedirectUrl = new URL(config.cas.ssoUrl);
	ssoRedirectUrl.searchParams.set('service', callbackUrl.href);

	res.redirect(ssoRedirectUrl.href);
};

const loginMock = (req, res, next) => {
	const options = {
		limit: 1,
		order: [['createdAt', 'ASC']],
	};
	models.User.findAll(options)
		.then((users) => users[0])
		.then((user) => {
			req.session.user = user;
			req.session.email = user.email;
			req.session.org = '09';
			req.session.name = user.name;
			res.redirect(req.query.redirect);
		})
		.catch((error) => next(error));
};
// Load the mocked login check if this is a development instance.
exports.login = (
	(env === 'development') ? loginMock : login);

exports.casLogin = (req, res, next) => {
	// CAS emits each token for a specific service, identified by its strict URL
	// (including path, the querystring, etc.).
	// We are therefore forced to include the same information when validating
	// the token for our service.
	const serviceUrl = new URL(req.originalUrl, config.url);
	serviceUrl.searchParams.delete('ticket');

	const validationUrl = `${config.cas.ssoUrl}/p3/serviceValidate?`
		+ `service=${encodeURIComponent(serviceUrl.href)}&`
		+ `ticket=${encodeURIComponent(req.query.ticket)}`;

	got(validationUrl)
		.then((response) => {
			const parserOptions = {
				// Remove the XML namespace prefixes to access the parsed
				// object more easily.
				tagNameProcessors: [xmlProcessors.stripPrefix],
			};
			xml2js.parseString(response.body, parserOptions, (err, result) => {
				if (err) throw err;

				// Go to /failed-login if the token isn't valid.
				const { serviceResponse } = result;
				// TODO: Make /failed-login display the user a view indicating
				// that there was an authentication issue. This can be done
				// with react-router, for instance.
				if (serviceResponse.authenticationFailure) return res.redirect('/failed-login');

				serviceResponse.authenticationSuccess.forEach((obj) => {
					// Find the user and add it to req.session.
					if ('user' in obj) {
						[req.session.email] = obj.user;
					}
					// Find the relevant attributes and store them in
					// req.session as well.
					if ('attributes' in obj) {
						const [attributes] = obj.attributes;
						[req.session.org] = attributes.o;
						[req.session.name] = attributes.cn;
						[req.session.surname] = attributes.sn;
					}
				});

				// Take the user back to wherever they were before the login.
				return next();
			});
		})
		.catch((e) => next(e));
};

exports.create = (req, res, next) => {
	const options = {
		where: { email: req.session.email },
	};

	models.User.findOne(options)
		.then((user) => {
			if (!user) {
				return res.redirect('/user/new');
			}
			req.session.user = user;
			return res.redirect(req.query.redirect);
		})
		.catch((error) => next(error));
};

exports.index = (req, res) => {
	const currentSession = req.session ? req.session : {};
	res.json(currentSession);
};

exports.destroy = (req, res) => {
	delete req.session.user;
	res.json({}); // redirect to login gage
};

// Auth middlewares
exports.loginRequired = (req, res, next) => {
	if (!req.session.user) next(new UnauthorizedError());
	next();
};

exports.adminRequired = (req, res, next) => {
	const isAdmin = !!req.session.user.isAdmin;
	if (!isAdmin) next(new UnauthorizedError());
	next();
};

exports.myselfRequired = (req, res, next) => {
	const isMyself = req.owner.id === req.session.user.id;
	if (!isMyself) next(new UnauthorizedError());
	next();
};

exports.adminOrMyselfRequired = (req, res, next) => {
	const isAdmin = !!req.session.user.isAdmin;
	const isMyself = req.owner.id === req.session.user.id;
	if (!isMyself && !isAdmin) next(new UnauthorizedError());
	next();
};