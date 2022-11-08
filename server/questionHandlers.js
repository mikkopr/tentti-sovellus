
//TODO: transaction
const addQuestionToExam = async (pool, examId, data) =>
{
  if (data == undefined || data.teksti === undefined || data.kysymys_numero === undefined || 
      data.pisteet === undefined) {
    throw new Error('Invalid data: received question data is invalid');
  }
  try {
    const questionResult = await addQuestion(pool, data.teksti);
    //TODO verify result before continuing
    const text = "INSERT INTO tentti_kysymys_liitos (tentti_id, kysymys_id, kysymys_numero, pisteet) VALUES ($1, $2, $3, $4)";
    const values = [examId, questionResult.id, data.kysymys_numero, data.pisteet];
    const result = await pool.query(text, values);
    return questionResult;
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

const addQuestion = async (pool, questionText) =>
{
  const text = "INSERT INTO kysymys (teksti) VALUES($1) RETURNING id";
  const values = [questionText];
  try {
    const result = await pool.query(text, values);
    return result?.rows[0];
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

/**
 * Deletes the question from tentti_kysymys_liitos
 */
const removeQuestionFromExam = async (pool, examId, questionId) =>
{
  const text = "DELETE FROM tentti_kysymys_liitos WHERE tentti_id=$1 AND kysymys_id=$2";
  const values = [examId, questionId];
  try {
    const result = await pool.query(text, values);
    return result?.rows[0];
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

const addAnswerToQuestion = async (pool, questionId, data) =>
{
  if (data == undefined || data.teksti === undefined || data.oikein === undefined) {
    throw new Error('Invalid data: received answer data is invalid');
  }
  const text = "INSERT INTO vastaus (teksti, oikein, kysymys_id) VALUES ($1, $2, $3) RETURNING id";
  const values = [data.teksti, data.oikein, questionId];
  try {
    const result = await pool.query(text, values);
    return result?.rows[0];
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

const fetchQuestions = async (pool, examId) =>
{
  const text = "SELECT kysymys.id, kysymys.teksti, tentti_kysymys_liitos.kysymys_numero, tentti_kysymys_liitos.pisteet FROM kysymys INNER JOIN tentti_kysymys_liitos ON kysymys.id=tentti_kysymys_liitos.kysymys_id WHERE tentti_kysymys_liitos.tentti_id=$1";
  const values = [examId];
  try {
    const result = await pool.query(text, values);
    return result?.rows;
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

const fetchAnswers = async (pool, questionId) =>
{
  const text = "SELECT * FROM vastaus WHERE kysymys_id = $1";
  const values = [questionId];
  try {
    const result = await pool.query(text, values);
    return result?.rows;
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

const updateAnswer = async (pool, answerId, data) =>
{
  const text = "UPDATE vastaus SET teksti=$1, oikein=$2 WHERE id=$3 RETURNING *";
  const values = [data.teksti, data.oikein, answerId];
  try {
    const result = await pool.query(text, values);
    return result?.rows[0];
  }
  catch (err) {
    throw new Error('Query error: ' + err.message);
  }
}

module.exports = {addQuestionToExam, addAnswerToQuestion, fetchQuestions, fetchAnswers, updateAnswer, removeQuestionFromExam};
