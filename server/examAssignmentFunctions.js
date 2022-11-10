
const assignUserToExam = async (pool, userId, examId) =>
{
  const text = "INSERT INTO tentti_suoritus (kayttaja_id, tentti_id) VALUES ($1, $2) RETURNING *";
  const values = [userId, examId];
  const result = await pool.query(text, values);
  return result?.rows[0];
}

module.exports = {assignUserToExam};
