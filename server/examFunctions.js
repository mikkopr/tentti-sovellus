
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

const fetchExamIncludingAnswers = async (pool, id, includeCorrectness) =>
{
	const text = includeCorrectness ?
		`SELECT 
		tentti.id, kysymys.id AS question_id, vastaus.id AS answer_id,
		tentti.nimi AS name, tentti.alkuaika AS begin, tentti.loppuaika AS end, tentti.tekoaika_mins AS available_time,
		kysymys.teksti AS question_text, tentti_kysymys_liitos.kysymys_numero AS number, tentti_kysymys_liitos.pisteet AS points,
		vastaus.teksti AS answer_text, vastaus.oikein AS answer_correct
		FROM tentti 
		INNER JOIN tentti_kysymys_liitos ON tentti.id = tentti_kysymys_liitos.tentti_id
		INNER JOIN kysymys ON kysymys.id=tentti_kysymys_liitos.kysymys_id
		INNER JOIN vastaus ON kysymys.id=vastaus.kysymys_id
		WHERE tentti_id=$1 ORDER BY kysymys.id`
		:
		`SELECT 
		tentti.id, kysymys.id AS question_id, vastaus.id AS answer_id,
		tentti.nimi AS name, tentti.alkuaika AS begin, tentti.loppuaika AS end, tentti.tekoaika_mins AS available_time,
		kysymys.teksti AS question_text, tentti_kysymys_liitos.kysymys_numero AS number, tentti_kysymys_liitos.pisteet AS points,
		vastaus.teksti AS answer_text
		FROM tentti 
		INNER JOIN tentti_kysymys_liitos ON tentti.id = tentti_kysymys_liitos.tentti_id
		INNER JOIN kysymys ON kysymys.id=tentti_kysymys_liitos.kysymys_id
		INNER JOIN vastaus ON kysymys.id=vastaus.kysymys_id
		WHERE tentti_id=$1 ORDER BY kysymys.id`;
	
	const queryResult = await pool.query(text, [id]);
	
	if (queryResult.rowCount === 0) {
		return undefined;
	}
	//OBS!: Its assumed that rows are ordered by question id
	const rows = queryResult.rows;
	const result = rows.reduce((exam, curr) => {
			if (curr.question_id !== exam.questions.at(-1)?.id) {
				exam.questions.push({id: curr.question_id, text: curr.question_text, number: curr.number, points: curr.points, answers: []});
			}
			if (includeCorrectness) {
				exam.questions.at(-1).answers.push({id: curr.answer_id, text: curr.answer_text, answer_correct: curr.answer_correct});
			}
			else {
				exam.questions.at(-1).answers.push({id: curr.answer_id, text: curr.answer_text});
			}
			return exam;
		}, 
		{id: rows[0].id, name: rows[0].name, begin: rows[0].begin, end: rows[0].end, available_time: rows[0].available_time, questions: []});
	
	return result;
}


/**
 * Returns exams without questions and answers
 * 
 * NOTE column names in result are lowercase even when AS is used
 */
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

module.exports = {addExam, deleteExam, updateExam, fetchExam, fetchExamIncludingAnswers, fetchExams};
