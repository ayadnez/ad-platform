const router = require('express').Router();

const assignAdminRole = require('../controllers/admin.controller');
const { getAllAds } = require('../controllers/user.controller');
const { authUser ,authorizeRole} = require('./auth');

// admin routes
router.get('/ads', authUser, authorizeRole(['admin']), getAllAds);
router.post('/assign-admin', authUser, authorizeRole(['admin']), assignAdminRole);


module.exports = router;