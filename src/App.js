
import './App.css';

import Tentti from './Tentti';

const App = () => {
  let kysymys1 = {kysymys: "Ensimmäinen kysymys?", vastaukset: ["vastaus1","vastaus2"]};
  let kysymys2 = {kysymys: "Toinen kysymys?", vastaukset: ["vastaus1","vastaus2"]};

  let tentti1 = {
    nimi: "Haskell perusteet",
    kysymykset: [kysymys1, kysymys2]
  };

  let tentti2 = {
    nimi: "Javascript perusteet",
    kysymykset: [kysymys1, kysymys2]
  };

  let tentit = [tentti1];

  return (
    <div className='App'>
      {tentit.map( tentti => <Tentti nimi={tentti.nimi} kysymykset={tentti.kysymykset}/> )}
    </div>
    );
};

export default App;
