
const {Pool, Client} = require('pg');

/**
 * @param date (date instanceof Date) == true
 */
const addExam = async (pool, name, description, date) => 
{
  const text = "INSERT INTO exam(name, description, date) VALUES($1, $2, $3)";
  const values = [name, description, date];
  try {
    const result = await pool.query(text, values);
    return true;
  }
  catch (err) {
    console.log('addExam failed: ', err);
    return false;
  }
};

const deleteExam = async (pool, id) =>
{
  const text = "DELETE FROM exam WHERE id=$1";
  const values = [id];
  try {
    const result = await pool.query(text, values);
    return true;
  }
  catch (err) {
    console.log('deleteExam failed: ', err);
    return false;
  }
};

const updateExam = async (pool, id, name, description) =>
{
  const text = "UPDATE exam SET name = $2, description = $3 WHERE id=$1";
  const values = [id, name, description];
  try {
    const result = await pool.query(text, values);
    return true;
  }
  catch (err) {
    console.log('updateExam failed: ', err);
    return false;
  }
};

const getExams = async (pool) =>
{
  const text = "SELECT * FROM exam";
  try {
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    console.log('getAllExams failed: ', err);
    return undefined;
  }
};

const getExam = async (pool, id) =>
{
  const text = "SELECT * FROM exam WHERE id=$1";
  const values = [id];
  try {
    const result = await pool.query(text, values);
    return (result.rows.count > 0 ? result.rows[0] : undefined);
  }
  catch (err) {
    console.log('getExam failed: ', err);
    return undefined;
  }
};

const getExamByName = async (pool, name) =>
{
  const text = "SELECT * FROM exam WHERE name=$1 ORDER BY description ASC";
  const values = [name];
  try {
    const result = await pool.query(text, values);
    return result.rows;
  }
  catch (err) {
    console.log('getExamByName failed: ', err);
    return undefined;
  }
};

const getExamByDescription = async (pool, description) =>
{
  const text = "SELECT * FROM exam WHERE description=$1 ORDER BY name ASC";
  const values = [description];
  try {
    const result = await pool.query(text, values);
    return result.rows;
  }
  catch (err) {
    console.log('getExamByDescription failed: ', err);
    return undefined;
  }
};

/**
 * Returns exams that have an id in the list
 * 
 */
const getExamByIds = async (pool, idList) =>
{
  const sqlListInjectionSecured = '(' + idList.map(item => +item).join(',') + ')';
  //const text = "SELECT * FROM exam WHERE id IN $1";
  const text = `SELECT * FROM exam WHERE id IN ${sqlListInjectionSecured}`;
  //const values = [idList];
  try {
    //const result = await pool.query(text, values);
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    console.log('getExamByIds failed: ', err);
    return undefined;
  }
};

const getExamByDateBefore = async (pool, dateBefore) =>
{
  //TODO: test if works when the begin is a date object instead of number 0
  //const text = "SELECT * FROM exam WHERE date BETWEEN 0 AND $1";
  const text = "SELECT * FROM exam WHERE date < $1";
  const values = [dateBefore];
  try {
    //const result = await pool.query(text, values);
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    console.log('getExamByDateBefore failed: ', err);
    return undefined;
  }
};

const getActiveExams = async (pool) =>
{
  const text = "SELECT * FROM exam WHERE active=TRUE ORDER BY name ASC";
  try {
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    console.log('getActiveExams failed: ', err);
    return undefined;
  }
}

const setExamActive = async (pool, id) =>
{
  const text = "UPDATE exam SET active = TRUE WHERE id=$1";
  const values = [id];
  try {
    const result = await pool.query(text, values);
    return true;
  }
  catch (err) {
    console.log('setExamActive failed: ', err);
    return false;
  }
}

/**************
 * Testing
 */

/**
 * Fills the exam table with generated data
 */
const fillExamTable = (pool) =>
{
  //new Date(dateString), dateString is assumed to be UTC time, the result
  //is in the local time zone
  //
  //month 0->, day 1->, argumnets are assumed to be in local time zone
  const refDate = new Date(2022, 11, 10);
  const numExams = 10;
  for (let i = 1; i <= numExams; i++) {
    let name = 'tentti' + i;
    let description = 'kuvaus' + i;
    let date = new Date(refDate.getTime() - (30 * 24 * 3600 * 1000) * i);
    if (!addExam(pool, name, description, date)) {
      console.log('\n\nfillExamTable: addExam failed, aborts the fill task\n');
      return;
    }
  }
  console.log('fillExamTable: DONE');
}

const pool = new Pool({
  user: '',
  host: 'localhost',
  database: '',
  password: '',
  port: ,
});

const executeTasks = async () =>
{
  //let result = await fillExamTable(pool);
  //let result = await deleteExam(pool, 10);
  
  //let result = await updateExam(pool, 1, 'tentti04', 'kuvaus04');
  //console.log('getExam:\n', result);

  //let result = await getExams(pool);
  //console.log('getExams:\n', result);

  //let result = await getExam(pool, 5);
  //console.log('getExam:\n', result);

  /*await updateExam(pool, 3, 'javascript', 'kuvaus a');
  await updateExam(pool, 2, 'javascript', 'kuvaus b');
  await updateExam(pool, 4, 'javascript', 'kuvaus c');*/
  //let result = await getExamByName(pool, 'javascript');
  //console.log('getExamByName:\n', result);

  //let result = await getExamByIds(pool, [1,2,3]);
  //console.log('getExamByIds:\n', result);

  //const currentDate = new Date();
  //let result = await getExamByDateBefore(pool, currentDate.getTime());
  //console.log('getExamByDateBefore:\n', result);

  let result = await setExamActive(pool, 3);
  result = await setExamActive(pool, 6);
  result = await getActiveExams(pool);
  console.log('getActiveExams:\n', result);

  await pool.end();
};

executeTasks();
