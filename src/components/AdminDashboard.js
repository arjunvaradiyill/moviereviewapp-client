import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const VALID_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    genre: [],
    director: '',
    cast: [''],
    posterUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  
  // Refs for focus management
  const deleteConfirmRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  // Focus management for delete confirmation
  useEffect(() => {
    if (showDeleteConfirm && deleteConfirmRef.current) {
      deleteConfirmRef.current.focus();
    }
  }, [showDeleteConfirm]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (error) {
      toast.error('Error fetching movies');
      console.error('Error fetching movies:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleGenreChange = (e) => {
    const selectedGenres = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      genre: selectedGenres
    }));
    setErrors(prev => ({
      ...prev,
      genre: undefined
    }));
  };

  const handleCastChange = (index, value) => {
    const newCast = [...formData.cast];
    newCast[index] = value;
    setFormData(prev => ({
      ...prev,
      cast: newCast
    }));
    setErrors(prev => ({
      ...prev,
      cast: undefined
    }));
  };

  const addCastMember = () => {
    setFormData(prev => ({
      ...prev,
      cast: [...prev.cast, '']
    }));
  };

  const removeCastMember = (index) => {
    if (formData.cast.length > 1) {
      const newCast = formData.cast.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        cast: newCast
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const year = parseInt(formData.releaseYear);
    if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
      newErrors.releaseYear = 'Invalid release year';
    }

    if (formData.genre.length === 0) {
      newErrors.genre = 'At least one genre must be selected';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Director is required';
    }

    if (formData.cast.some(member => !member.trim())) {
      newErrors.cast = 'All cast members must have names';
    }

    try {
      new URL(formData.posterUrl);
    } catch {
      newErrors.posterUrl = 'Invalid poster URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/movies', {
        ...formData,
        cast: formData.cast.filter(member => member.trim())
      });
      
      toast.success('Movie created successfully');
      setFormData({
        title: '',
        description: '',
        releaseYear: new Date().getFullYear(),
        genre: [],
        director: '',
        cast: [''],
        posterUrl: ''
      });
      fetchMovies();
      // Focus the form after successful submission
      if (formRef.current) {
        formRef.current.querySelector('input[name="title"]').focus();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating movie';
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (movieId) => {
    setMovieToDelete(movieId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/movies/${movieToDelete}`);
      toast.success('Movie deleted successfully');
      fetchMovies();
    } catch (error) {
      toast.error('Error deleting movie');
      console.error('Error deleting movie:', error);
    } finally {
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMovieToDelete(null);
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mt-5">
      <div className="alert alert-danger" role="alert">Access denied. Admin privileges required.</div>
    </div>;
  }

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Add New Movie</h3>
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Release Year</label>
              <input
                type="number"
                className={`form-control ${errors.releaseYear ? 'is-invalid' : ''}`}
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
                min="1888"
                max={new Date().getFullYear() + 5}
              />
              {errors.releaseYear && <div className="invalid-feedback">{errors.releaseYear}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Genre</label>
              <select
                multiple
                className={`form-control ${errors.genre ? 'is-invalid' : ''}`}
                name="genre"
                value={formData.genre}
                onChange={handleGenreChange}
                size="5"
              >
                {VALID_GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <small className="form-text text-muted">Hold Ctrl/Cmd to select multiple genres</small>
              {errors.genre && <div className="invalid-feedback">{errors.genre}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Director</label>
              <input
                type="text"
                className={`form-control ${errors.director ? 'is-invalid' : ''}`}
                name="director"
                value={formData.director}
                onChange={handleInputChange}
              />
              {errors.director && <div className="invalid-feedback">{errors.director}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Cast</label>
              {formData.cast.map((member, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className={`form-control ${errors.cast ? 'is-invalid' : ''}`}
                    value={member}
                    onChange={(e) => handleCastChange(index, e.target.value)}
                    placeholder="Cast member name"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeCastMember(index)}
                    disabled={formData.cast.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {errors.cast && <div className="invalid-feedback d-block">{errors.cast}</div>}
              <button type="button" className="btn btn-outline-secondary" onClick={addCastMember}>
                Add Cast Member
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Poster URL</label>
              <input
                type="url"
                className={`form-control ${errors.posterUrl ? 'is-invalid' : ''}`}
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/poster.jpg"
              />
              {errors.posterUrl && <div className="invalid-feedback">{errors.posterUrl}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Movie'}
            </button>
          </form>
        </div>
      </div>

      <h3>Movie List</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Release Year</th>
              <th>Genre</th>
              <th>Director</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie._id}>
                <td>{movie.title}</td>
                <td>{movie.releaseYear}</td>
                <td>{movie.genre.join(', ')}</td>
                <td>{movie.director}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteClick(movie._id)}
                    aria-label={`Delete ${movie.title}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          role="dialog" 
          aria-labelledby="deleteModalLabel"
          aria-modal="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleDeleteCancel}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this movie?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  ref={deleteConfirmRef}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 