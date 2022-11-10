
const express = require('express');

const {dbConnPool} = require('../db');
const {validateReqParamId} = require('../validateFunctions');

const router = express.Router();

/**
 * Handles /kayttajat
 */

router.get('/', async (req, res) => 
{
  res.status(200).send('NOT IMPLEMENTED');
});

router.get('/:userId', async (req, res) => {
});

router.post('/', async (req, res) => {
});

router.put('/:userId', async (req, res) => {
});

router.delete('/:userId', async (req, res) => {
});

module.exports = router;
