import { useState } from 'react';
import { buildPath } from './Path';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
}

function CardUI() {
  const [message, setMessage] = useState('');
  const [searchResults, setResults] = useState('');
  const [cardList, setCardList] = useState('');
  const [search, setSearchValue] = useState('');
  const [companyName, setCompanyNameValue] = useState('');
  const [tickerSymbol, setTickerSymbol] = useState('');


  const _ud: any = localStorage.getItem('user_data');
  //const ud = _ud ? JSON.parse(_ud) : { id: 0 };
  const ud: UserData = _ud ? JSON.parse(_ud) : { id: 0, firstName: '', lastName: '' };
  const userId: number = ud.id;

  function handleSearchTextChange(e: any): void {
    setSearchValue(e.target.value);
  }

  function handleTickerSymbolChange(e: any): void {
    setTickerSymbol(e.target.value);
  }

  function handleCompanyNameChange(e: any): void {
    setCompanyNameValue(e.target.value);
  }

  async function searchCard(e: any): Promise<void> {
    e.preventDefault();

    const obj = { userId: userId, search: search };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('searchcards'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const txt = await response.text();
      const res = JSON.parse(txt);

      const _results = res.results;
      let resultText = '';

      for (let i = 0; i < _results.length; i++) {
        resultText += _results[i];
        if (i < _results.length - 1) resultText += ', ';
      }

      setResults('Card(s) have been retrieved');
      setCardList(resultText);
    } catch (error: any) {
      console.error(error);
      setResults('Error fetching cards');
    }
  }

  async function addCard(e: any): Promise<void> {
    e.preventDefault();
    //const obj = { userId, cardName, tickerSymbol };
    const obj = { userId: userId, cardName: companyName, tickerSymbol: tickerSymbol };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('addcard'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const txt = await response.text();
      const res = JSON.parse(txt);

      if (res.error && res.error.length > 0) {
        setMessage('API Error: ' + res.error);
      } else {
        setMessage('Stock Card has been added');
        setTickerSymbol('');  // Clear both inputs
        setCompanyNameValue('');   // after successful add
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  return (
    <div id="cardUIDiv">
      <br />
      Search:{' '}
      <input
        type="text"
        id="searchText"
        placeholder="Card To Search For"
        onChange={handleSearchTextChange}
      />
      <button
        type="button"
        id="searchCardButton"
        className="buttons"
        onClick={searchCard}
      >
        Search Card
      </button>
      <br />
      <span id="cardSearchResult">{searchResults}</span>
      <p id="cardList">{cardList}</p>
      <br />
      <br />

      Add:{' '}
      <input
        type="text"
        id="companyName"
        placeholder="Company Name"
        value={companyName}
        onChange={handleCompanyNameChange}
      />
      <input
        type="text"
        id="tickerSymbol"
        placeholder="Ticker Symbol(ex. AAPL)"
        value={tickerSymbol}
        onChange={handleTickerSymbolChange}
      />
      <button
        type="button"
        id="addCardButton"
        className="buttons"
        onClick={addCard}
      >
        Add Stock
      </button>
      <br />
      <span id="cardAddResult">{message}</span>
    </div>
  );
}

export default CardUI;
