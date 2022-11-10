
const {getDbConnConfig} = require('./dbConnConfig');
const {Pool} = require('pg');

console.log("const pool = new Pool(getDbConnConfig())");
const pool = new Pool(getDbConnConfig());

const dbConnPool = () => pool;

module.exports = {dbConnPool};
