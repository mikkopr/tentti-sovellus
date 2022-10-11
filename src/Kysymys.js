
const Kysymys = (props) => {
    return (
    <div className="kysymys">
        <div className="kysymys-teksti">{props.kysymys}</div>
        <div>
            {props.vastaukset.map( vastaus => {return (<div>{vastaus}</div>)} )}
        </div>
    </div>
    );
} 

export default Kysymys;
