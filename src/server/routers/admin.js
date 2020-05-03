const express = require('express');
const defaultController = require('../controllers/defaultController');
const location = require('../controllers/admin/location');
const paymentMethod = require('../controllers/admin/paymentMethod');
const locker = require('../controllers/admin/locker');
const user = require('../controllers/admin/user');
const payment = require('../controllers/admin/payment');
const rental = require('../controllers/admin/rental');

const router = express.Router();

// Autoload for routes using :param
router.param(
	'locationId',
	defaultController.load(location.model, location.loadOptions),
);

// Routes for the model Location
router.get(
	'/locations',
	location.setDefaults, defaultController.index,
);
router.get(
	'/location/:locationId(\\d+)',
	defaultController.show,
);
router.post(
	'/location',
	location.create, defaultController.create,
);
router.put(
	'/location/:locationId(\\d+)',
	location.update, defaultController.update,
);
router.delete(
	'/location/:locationId(\\d+)',
	defaultController.destroy,
);

// Autoload for routes using :param
router.param(
	'lockerId',
	defaultController.load(locker.model, locker.loadOptions),
);
// Routes for the model locker
router.get(
	'/lockers',
	locker.setDefaults, defaultController.index,
);
router.get(
	'/locker/:lockerId(\\d+)',
	defaultController.show,
);
router.post(
	'/locker',
	locker.create, defaultController.create,
);
router.put(
	'/locker/:lockerId(\\d+)',
	locker.update, defaultController.update,
);
router.delete(
	'/locker/:lockerId(\\d+)',
	defaultController.destroy,
);

// Autoload for routes using :param
router.param(
	'paymentMethodId',
	defaultController.load(paymentMethod.model, paymentMethod.loadOptions),
);

// Routes for the model paymentMethod
router.get(
	'/paymentMethods',
	paymentMethod.setDefaults, defaultController.index,
);
router.get(
	'/paymentMethod/:paymentMethodId(\\d+)',
	defaultController.show,
);
router.post(
	'/paymentMethod',
	paymentMethod.create, defaultController.create,
);
router.put(
	'/paymentMethod/:paymentMethodId(\\d+)',
	paymentMethod.update, defaultController.update,
);
router.delete(
	'/paymentMethod/:paymentMethodId(\\d+)',
	defaultController.destroy,
);

// Autoload for routes using :param
router.param(
	'userId',
	defaultController.load(user.model, user.loadOptions),
);

// Routes for the model user
router.get(
	'/users',
	user.setDefaults, defaultController.index,
);
router.get(
	'/user/:userId(\\d+)',
	defaultController.show,
);
router.post(
	'/user',
	user.create, defaultController.create,
);
router.put(
	'/user/:userId(\\d+)',
	user.update, defaultController.update,
);
router.delete(
	'/user/:userId(\\d+)',
	defaultController.destroy,
);

// Autoload for routes using :param
router.param(
	'paymentId',
	defaultController.load(payment.model, payment.loadOptions),
);

// Routes for the model payment
router.get(
	'/payments',
	payment.setDefaults, defaultController.index,
);
router.get(
	'/payment/:paymentId(\\d+)',
	defaultController.show,
);
router.post(
	'/payment',
	payment.create, defaultController.create,
);
router.put(
	'/payment/:paymentId(\\d+)',
	payment.update, defaultController.update,
);
router.delete(
	'/payment/:paymentId(\\d+)',
	defaultController.destroy,
);

// Autoload for routes using :param
router.param(
	'paymentId',
	defaultController.load(rental.model, rental.loadOptions),
);

// Routes for the model rental
router.get(
	'/rentals',
	rental.setDefaults, defaultController.index,
);
router.get(
	'/rental/:rentalId(\\d+)',
	defaultController.show,
);
router.post(
	'/rental',
	rental.create, defaultController.create,
);
router.put(
	'/rental/:rentalId(\\d+)',
	rental.update, defaultController.update,
);
router.delete(
	'/rental/:paymentId(\\d+)',
	defaultController.destroy,
);

module.exports = router;