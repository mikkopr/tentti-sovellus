
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
   try {
     const result = await pool.query(text, values);
     return result?.rows[0];
   }
   catch (err) {
     throw new Error('Query error: ' + err.message);
   }
 }
 
 const fetchExamQuestions = async (pool, examId) =>
 {
   const text = "SELECT kysymys.id, kysymys.teksti, tentti_kysymys_liitos.kysymys_numero, tentti_kysymys_liitos.pisteet FROM kysymys INNER JOIN tentti_kysymys_liitos ON kysymys.id=tentti_kysymys_liitos.kysymys_id WHERE tentti_kysymys_liitos.tentti_id=$1";
   const values = [examId];
   const result = await pool.query(text, values);
   return result?.rows;
 }
 
 const updateExamQuestion = async (pool, examId, questionId, data) =>
 {
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     let text = "UPDATE kysymys SET teksti=$1 WHERE id=$2 RETURNING *";
     let values = [data.teksti, questionId];
     const questionResult = await client.query(text, values);
     
     text = "UPDATE tentti_kysymys_liitos SET kysymys_numero=$3, pisteet=$4 WHERE tentti_id=$1 AND kysymys_id=$2)";
     values = [examId, questionId, data.kysymys_numero, data.pisteet];
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

 module.exports = {addQuestionToExam, fetchExamQuestions, updateExamQuestion, removeQuestionFromExam};
 