
const Question = (props) => {
    return (
    <div className="kysymys">
        <div className="kysymys-teksti">{props.question.question}</div>
        <div>
            {props.question.answers.map( answer => {return (<div>{answer}</div>)} )}
        </div>
    </div>
    );
} 

export default Question;
