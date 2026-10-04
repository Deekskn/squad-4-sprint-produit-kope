const express = require('express');
const verifierAuth = require('../middleware/verifierAuth');
const { getProfil, getContact } = require('../controllers/professionnelController');

const router = express.Router();

router.get('/:id/contact', verifierAuth, getContact);
router.get('/:id', verifierAuth, getProfil);

module.exports = router;
x