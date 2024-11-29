import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import axios from 'axios';

// API Setup
const API_KEY = 'd19b7770';  // Replace with your OMDB API Key
const BASE_URL = 'http://www.omdbapi.com/';

// Fetch Movies
const fetchMovies = async (searchTerm, page = 1) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        s: searchTerm,
        page: page,
        apikey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching movie data');
  }
};

// Fetch Movie Details
const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        i: movieId,
        apikey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching movie details');
  }
};

// Header Component with Search Bar
const Header = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // This ensures the form does not reload the page
    if (query) {
      onSearch(query); // Pass the query to the parent component
    }
  };

  return (
    <header>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </header>
  );
};

// Movie Card Component to Display Movie Information
const MovieCard = ({ movie, onShowDetails }) => {
  return (
    <div className="movie-card">
      <img src={movie.Poster} alt={movie.Title} />
      <h3>{movie.Title}</h3>
      <p>{movie.Year}</p>
      {/* Link to show movie details inside a modal */}
      <button onClick={() => onShowDetails(movie.imdbID)}>Details</button>
    </div>
  );
};

// Movie List Component to Display List of Movies
const MovieList = ({ movies, onShowDetails }) => {
  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} onShowDetails={onShowDetails} />
      ))}
    </div>
  );
};

// Movie Details Modal Component
const MovieDetailsModal = ({ movie, onClose }) => {
  return (
    <div className="movie-details-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{movie.Title}</h2>
        <div className="movie-poster">
          <img src={movie.Poster} alt={movie.Title} />
        </div>
        <div className="details-section">
          <div>
            <p><strong>Year:</strong> {movie.Year}</p>
            <p><strong>Genre:</strong> {movie.Genre}</p>
            <p><strong>Director:</strong> {movie.Director}</p>
            <p><strong>Actors:</strong> {movie.Actors}</p>
            <p><strong>IMDB Rating:</strong> {movie.imdbRating}</p>
            <p><strong>Language:</strong> {movie.Language}</p>
            <p><strong>Country:</strong> {movie.Country}</p>
            <p><strong>Plot:</strong> {movie.Plot}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// Pagination Component with "Previous" and "Next" Button Logic
const Pagination = ({ currentPage, totalPages, onPageChange, onNextPage, onPreviousPage }) => {
  const pages = [];
  const maxPagesToShow = 5;

  // If there are more than 5 pages, show only the first 5 pages initially
  for (let i = 1; i <= Math.min(totalPages, maxPagesToShow); i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      {/* Previous Button - show only if currentPage >= 6 */}
      {currentPage >= 6 && (
        <button
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
      )}

      {/* Page Buttons */}
      {pages.map((page) => (
        <button
          key={page}
          className={currentPage === page ? 'active' : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* Show next button if there are more than 5 pages */}
      {totalPages > maxPagesToShow && (
        <button onClick={onNextPage}>
          Next
        </button>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null); // For storing the movie that is clicked
  const [isModalOpen, setIsModalOpen] = useState(false); // For controlling modal visibility
  const [showMovieList, setShowMovieList] = useState(true); // For controlling visibility of movie list

  const searchMovies = async (searchQuery, page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMovies(searchQuery, page);
      if (data.Response === 'True') {
        setMovies(data.Search);
        setTotalPages(Math.ceil(data.totalResults / 10)); // Calculate total pages
      } else {
        setError('No movies found');
      }
    } catch (error) {
      setError('Failed to fetch movies');
    }
    setLoading(false);
  };

  const handleSearch = (query) => {
    setQuery(query); // Set the search query in the state
    searchMovies(query); // Fetch movies based on the query
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchMovies(query, page);  // Use the current search query to get movies for that page
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      searchMovies(query, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const previousPage = currentPage - 1;
      setCurrentPage(previousPage);
      searchMovies(query, previousPage);
    }
  };

  // Function to show movie details in modal
  const showMovieDetails = async (movieId) => {
    const movieDetails = await fetchMovieDetails(movieId);
    setSelectedMovie(movieDetails);
    setIsModalOpen(true); // Open the modal
    setShowMovieList(false); // Hide the movie list
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
    setShowMovieList(true); // Show the movie list again when modal is closed
  };

  return (
    <Router>
      <div className="App">
        <Header onSearch={handleSearch} />
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {showMovieList && <MovieList movies={movies} onShowDetails={showMovieDetails} />}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
            />
          </>
        )}

        {/* Show modal if it's open */}
        {isModalOpen && selectedMovie && (
          <MovieDetailsModal movie={selectedMovie} onClose={closeModal} />
        )}
      </div>
    </Router>
  );
};

export default App;