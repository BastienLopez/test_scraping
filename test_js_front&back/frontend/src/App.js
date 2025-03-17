import React, { useEffect, useState } from "react";
import "./styles.css";

const App = () => {
  const [annonces, setAnnonces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/annonces")
      .then((response) => response.json())
      .then((data) => setAnnonces(data))
      .catch((error) => console.error("Erreur:", error));
  }, []);

  return (
    <div className="container">
      <h1>🕹️ Annonces Manette PS5</h1>
      <ul>
        {annonces.map((annonce, index) => (
          <li key={index} className="annonce">
            <a href={annonce.link} target="_blank" rel="noopener noreferrer">
              <strong>{annonce.title}</strong> - {annonce.price}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
