
/****************
 * Question
 */

const addQuestion = async (pool, questionText) =>
{
  const text = "INSERT INTO kysymys (teksti) VALUES($1) RETURNING *";
  const values = [questionText];
  const result = await pool.query(text, values);
  return result?.rows[0];
}

const updateQuestion = async (pool, questionId, data) =>
{
  const text = "UPDATE kysymys SET teksti=$1 WHERE id=$2 RETURNING *";
  const values = [data.teksti, questionId];
  const result = await client.query(text, values);
  return result?.rows[0];
}

const addAnswerToQuestion = async (pool, questionId, data, res) =>
{
  const text = "INSERT INTO vastaus (teksti, oikein, kysymys_id) VALUES ($1, $2, $3) RETURNING *";
  const values = [data.teksti, data.oikein, questionId];
  const result = await pool.query(text, values);
  return result?.rows[0];
}

const fetchAnswers = async (pool, questionId) =>
{
  const text = "SELECT * FROM vastaus WHERE kysymys_id = $1";
  const values = [questionId];
  const result = await pool.query(text, values);
  return result?.rows;
}

module.exports = {addQuestion, addAnswerToQuestion, fetchAnswers, updateQuestion};
