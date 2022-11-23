
/****************
 * Question
 */

const fetchQuestions = async (pool) =>
{
  const result = await pool.query("SELECT * FROM kysymys");
  return result.rows;
}

const fetchQuestion = async (pool, id) =>
{
  const text = "SELECT * FROM kysymys WHERE id=$1";
  const values = [id];
  const result = await pool.query(text, values);
  return result.rows[0];
};

const fetchQuestionAndAnswers = async (pool, questionId) =>
{
  const text = `SELECT kysymys.id, kysymys.teksti AS text, tentti_kysymys_liitos.kysymys_numero AS number, tentti_kysymys_liitos.pisteet AS points,
		vastaus.teksti AS answer_text, vastaus.oikein AS answer_correct, vastaus.id AS answer_id 
		FROM kysymys 
		LEFT JOIN tentti_kysymys_liitos ON tentti_kysymys_liitos.kysymys_id=kysymys.id
		LEFT JOIN vastaus ON vastaus.kysymys_id=kysymys.id
		WHERE kysymys.id = $1`;
	const values = [questionId];
  const result = await pool.query(text, values);
  return result.rows;
}

const addQuestion = async (pool, questionText) =>
{
  const text = "INSERT INTO kysymys (teksti) VALUES($1) RETURNING *";
  const values = [questionText];
  const result = await pool.query(text, values);
  return result.rows[0];
}

const updateQuestion = async (pool, questionId, data) =>
{
  const text = "UPDATE kysymys SET teksti=$1 WHERE id=$2 RETURNING id, teksti AS text";
  const values = [data.text, questionId];
  const result = await pool.query(text, values);
  return result.rows[0];
}

const addAnswerToQuestion = async (pool, questionId, data, res) =>
{
  const text = "INSERT INTO vastaus (teksti, oikein, kysymys_id) VALUES ($1, $2, $3) RETURNING id, teksti AS text, oikein AS correct";
  const values = [data.teksti, data.oikein, questionId];
  const result = await pool.query(text, values);
  return result.rows[0];
}

const fetchAnswers = async (pool, questionId) =>
{
  const text = "SELECT * FROM vastaus WHERE kysymys_id = $1";
  const values = [questionId];
  const result = await pool.query(text, values);
  return result.rows;
}

const fetchAnswersWithoutCorrectness = async (pool, questionId) =>
{
  const text = "SELECT id, teksti, kysymys_id FROM vastaus WHERE kysymys_id = $1";
  const values = [questionId];
  const result = await pool.query(text, values);
  return result.rows;
}

module.exports = {fetchQuestions, fetchQuestion, fetchQuestionAndAnswers, addQuestion, addAnswerToQuestion, fetchAnswers, fetchAnswersWithoutCorrectness, updateQuestion};
