
const addExam = async (pool, data) => 
{
  const text = "INSERT INTO tentti(nimi, kuvaus, tekoaika_mins) VALUES($1, $2, $3) RETURNING id, nimi AS name, kuvaus AS description, alkuaika AS begin, loppuaika AS end, tekoaika_mins AS available_time";
  const values = [data.name, data.description, data.available_time];
  try {
    const result = await pool.query(text, values);
    return result.rows[0];
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
};

const deleteExam = async (pool, examId) =>
{
	await pool.query("DELETE FROM tentti WHERE id=$1", [examId]);
}

const fetchExam = async (pool, id) =>
{
  const text = "SELECT id, nimi AS name, kuvaus AS description, alkuaika AS begin, loppuaika AS end, tekoaika_mins AS available_time FROM tentti WHERE id=$1";
  const values = [id];
  try {
    const result = await pool.query(text, values);
    //Javascript doesn't need count checking
    return (result.rowCount > 0 ? result.rows[0] : undefined);
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
};

//NOTE column names in result are uncapitalized even when defined othewise in AS
const fetchExams = async (pool) =>
{
  const text = "SELECT id, nimi AS name, kuvaus AS description, alkuaika AS begin, loppuaika AS end, tekoaika_mins AS available_time FROM tentti ORDER BY nimi ASC";
  try {
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
};

const updateExam = async (pool, examId, data) =>
{
  let text = "UPDATE tentti SET nimi=$2, kuvaus=$3, tekoaika_mins=$4" //, alkuaika=$5, loppuaika=$6 WHERE id=$1 RETURNING *";
	const values = [examId, data.name, data.description, data.available_time]; // new Date(data.begin), new Date(data.end), ];
	if (data.begin) {
		text += ",alkuaika=$5";
		values.push(new Date(data.begin));
	}
	if (data.end) {
		text += ",loppuaika=$6";
		values.push(new Date(data.end));
	}
	text += " WHERE id=$1 RETURNING id, nimi AS name, kuvaus AS description, alkuaika AS begin, loppuaika AS end, tekoaika_mins AS available_time";  
  const result = await pool.query(text, values);
  return result.rows[0];
}

module.exports = {addExam, deleteExam, updateExam, fetchExam, fetchExams};
