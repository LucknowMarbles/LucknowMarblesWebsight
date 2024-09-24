/*import React, { useState } from 'react';
import algoliaClient from './algolia';

const Search = () => {
  const index = algoliaClient.initIndex('your_actual_index_name');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    const { hits } = await index.search(e.target.value);
    setResults(hits);
  };

  return (
    <div>
      <input type="text" value={query} onChange={handleSearch} placeholder="Search products..." />
      <ul>
        {results.map(result => (
          <li key={result.objectID}>
            <img src={result.image} alt={result.name} />
            <h2>{result.name}</h2>
            <p>Quantity: {result.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
*/