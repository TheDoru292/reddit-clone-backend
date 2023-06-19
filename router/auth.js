const express = require('express');
const router = express.Router();
require('../passport');

const Auth = require('../controllers/authController');

router.post('/register', Auth.register);

module.exports = router;
