
/**
 * Creates a new question and adds it to the exam.
 * 
 * Returns the created question if succesful.
 */
const addQuestionToExam = async (pool, examId, data) =>
{
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let text = "INSERT INTO kysymys (teksti) VALUES($1) RETURNING *";
    let values = [data.teksti];
    const questionResult = await client.query(text, values);
    
    text = "INSERT INTO tentti_kysymys_liitos (tentti_id, kysymys_id, kysymys_numero, pisteet) VALUES ($1, $2, $3, $4)";
    values = [examId, questionResult.rows[0].id, data.kysymys_numero, data.pisteet];
    await client.query(text, values);
    await client.query('COMMIT');
    return questionResult.rows[0];
  }
  catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  finally {
    client.release();
  }
}
 
 /**
  * Deletes the question from tentti_kysymys_liitos
  */
const removeQuestionFromExam = async (pool, examId, questionId) =>
{
	const text = "DELETE FROM tentti_kysymys_liitos WHERE tentti_id=$1 AND kysymys_id=$2";
	const values = [examId, questionId];
	const result = await pool.query(text, values);
	return result.rows[0];
}
 
 const fetchExamQuestions = async (pool, examId) =>
 {
   const text = "SELECT kysymys.id, kysymys.teksti, tentti_kysymys_liitos.kysymys_numero, tentti_kysymys_liitos.pisteet FROM kysymys INNER JOIN tentti_kysymys_liitos ON kysymys.id=tentti_kysymys_liitos.kysymys_id WHERE tentti_kysymys_liitos.tentti_id=$1";
   const values = [examId];
   const result = await pool.query(text, values);
   return result.rows;
 }
 
const fetchExamIdsContainingQuestion = async (pool, questionId) =>
{
	const text = "SELECT tentti_id FROM tentti_kysymys_liitos WHERE kysymys_id=$1";
	const values = [questionId];
	const result = await pool.query(text, values);
	return result.rows;
}

/**
 * Returns the updated question if successful. Returns undefined if an updated table
 * doesn't contain the given id. Otherwise throws an error.
 */
const updateExamQuestion = async (pool, examId, questionId, data) =>
{
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let text = "UPDATE kysymys SET teksti=$1 WHERE id=$2 RETURNING *";
    let values = [data.teksti, questionId];
    const questionResult = await client.query(text, values);
    
    if (questionResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return undefined;
    }

    //Without RETURNING update query returns updated rows count
    text = "UPDATE tentti_kysymys_liitos SET kysymys_numero=$3, pisteet=$4 WHERE tentti_id=$1 AND kysymys_id=$2)";
    values = [examId, questionId, data.kysymys_numero, data.pisteet];
    const updatedCount = await client.query(text, values);
    if (updatedCount === 0) {
      await client.query('ROLLBACK');
      return undefined;
    }

    await client.query('COMMIT');
    return questionResult.rows[0];
  }
  catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  finally {
    client.release();
  }
}

 module.exports = {addQuestionToExam, fetchExamQuestions, fetchExamIdsContainingQuestion, updateExamQuestion, removeQuestionFromExam};
 