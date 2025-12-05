import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [env, setEnv] = useState("...");

  useEffect(() => {
    fetch("/healthz")
      .then(res => {
        const backend = res.headers.get('X-Active-Backend') || '';
        if (backend.includes('blue')) setEnv('BLUE');
        else if (backend.includes('green')) setEnv('GREEN');
        else return fetch('/version.txt');
        return null;
      })
      .then(next => {
        if (!next) return;
        return next.text();
      })
      .then(text => {
        if (!text) return;
        if (text.includes('v1')) setEnv('BLUE');
        else if (text.includes('v2')) setEnv('GREEN');
        else setEnv('UNKNOWN');
      })
      .catch(() => setEnv('ERROR'));
  }, []);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dulce Valeria Miguel</h1>

        <p>
          Ambiente activo:{" "}
          <span style={{ 
            fontWeight: "bold", 
            color: env === "BLUE" ? "#3498db" : env === "GREEN" ? "#2ecc71" : "#e74c3c"
          }}>
            {env}
          </span>
        </p>

        <button className="counter-btn" onClick={handleClick}>
          Haz clic para incrementarr
        </button>

        <p>Contador: <span className="counter">{count}</span></p>
      </header>
    </div>
  );
}

export default App;
