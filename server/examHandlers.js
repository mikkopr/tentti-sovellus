
const addExam = async (pool, data) => 
{
  const date = new Date(data?.pvm); //TODO undefined?
  if (data === undefined || data.nimi === undefined || data.kuvaus === undefined || date === undefined) {
    throw new Error('Invalid data: received exam data is invalid');
  }
  const text = "INSERT INTO tentti(nimi, kuvaus, pvm) VALUES($1, $2, $3)";
  const values = [data.nimi, data.kuvaus, date];
  try {
    const result = await pool.query(text, values);
    return result;
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

module.exports = {addExam, fetchExam, fetchExams};
