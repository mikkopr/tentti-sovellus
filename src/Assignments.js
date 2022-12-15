
import Assignment from './Assignment.js';

/**
 * Props: {exams, assignments, showCompleted, dispatch}
 */
const Assignments = (props) =>
{
	return (
		<div>
		{props.showCompleted ? <h3>Suoritetut tentit</h3> : <h3>Ilmoittautumiset</h3>}
		{props.assignments.map( assignment =>
				<Assignment
					key={assignment.exam_id}
					assignment={assignment}
					exam={props.exams.find(item => item.id === assignment.exam_id)}
					showCompleted={props.showCompleted}
					dispatch={props.dispatch}
					/>
		)}
		</div>
	);
};

export default Assignments;
