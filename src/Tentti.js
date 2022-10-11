
import './App.css';
import Kysymys from './Kysymys';

const Tentti = (props) => {
    return (
        <div>
            <h3>{props.nimi}</h3>
            <div className='kysymys-lista'>
                {props.kysymykset.map( kysymys =>
                    <Kysymys kysymys={kysymys.kysymys} vastaukset={kysymys.vastaukset} /> )}
            </div>
        </div>
    );
};

export default Tentti;
