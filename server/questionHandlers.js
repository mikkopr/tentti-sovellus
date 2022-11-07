
const addQuestionToExam = async (pool, questionText, examId, questionNr) =>
{
  try {
    const questionId = await addQuestion(pool, questionText);
    const text = "INSERT INTO tentti_kysymys_liitos (tentti_id, kysymys_id, kysymys_numero) VALUES ($1, $2, $3)";
    const values = [examId, questionId, questionNr];
    const result = await pool.query(text, values);
    return questionId;
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
}

const addQuestion = async (pool, questionText) =>
{
  const text = "INSERT INTO kysymys (teksti) VALUES($1) RETURNING id";
  const values = [questionText];
  try {
    const result = await pool.query(text, values);
    return result?.rows[0]?.id;
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
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
    throw new Error('ERROR: query error: ' + err);
  }
}

module.exports = {addQuestionToExam, fetchAnswers};
