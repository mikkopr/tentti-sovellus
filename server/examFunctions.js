
const addExam = async (pool, data) => 
{
  const text = "INSERT INTO tentti(nimi, kuvaus, pvm) VALUES($1, $2, $3) RETURNING *";
  const values = [data.nimi, data.kuvaus, new Date(data.pvm)];
  try {
    const result = await pool.query(text, values);
    return result.rows[0];
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
};

const fetchExam = async (pool, id) =>
{
  const text = "SELECT * FROM tentti WHERE id=$1";
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

const fetchExams = async (pool) =>
{
  const text = "SELECT * FROM tentti";
  try {
    const result = await pool.query(text);
    return result.rows;
  }
  catch (err) {
    throw new Error('ERROR: query error: ' + err);
  }
};

const updateExam = async (pool) =>
{
  //Without returning clause returns the count of the upfated rows
  const text = "UPDATE tentti SET nimi=$1, kuvaus=$2, pvm=$3 RETURNING *";
  const values = [data.nimi, data.kuvaus, new Date(data.pvm)];
  const result = await pool.query(text, values);
  return result.rows[0];
}

module.exports = {addExam, fetchExam, fetchExams, updateExam};
