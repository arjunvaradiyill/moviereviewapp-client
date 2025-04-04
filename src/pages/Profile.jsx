import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
  Theaters as TheatersIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const Profile = () => {
  const { user, updateProfile, updateProfilePicture, uploadProfilePicture } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    watchlistCount: 0,
    reviewsCount: 0,
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPictureDialog, setOpenPictureDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });
  const [pictureUrl, setPictureUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
      });
      setPictureUrl(user.profilePicture || '');
      fetchUserStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      // Fetch watchlist count
      const watchlistResponse = await axios.get('/users/me/watchlist');
      const watchlistCount = watchlistResponse.data.length;

      // Fetch reviews count
      const reviewsResponse = await axios.get('/users/me/reviews/count');
      const reviewsCount = reviewsResponse.data.count;

      setStats({ watchlistCount, reviewsCount });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    // Reset form data
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
      });
    }
    setError('');
  };

  const handleOpenPictureDialog = () => {
    setPictureUrl(user.profilePicture || '');
    setOpenPictureDialog(true);
    setError('');
  };

  const handleClosePictureDialog = () => {
    setOpenPictureDialog(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePictureUrlChange = (e) => {
    setPictureUrl(e.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageLoading(true);
      setError('');

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        setImageLoading(false);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        setImageLoading(false);
        return;
      }

      // Upload the file
      const result = await uploadProfilePicture(file);
      
      // Update the local state with the new URL
      if (result && result.profilePicture) {
        setPictureUrl(result.profilePicture);
        setSuccess('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Basic validation
      if (!profileData.username.trim()) {
        setError('Username is required');
        setIsSubmitting(false);
        return;
      }

      if (!profileData.email.trim() || !/\S+@\S+\.\S+/.test(profileData.email)) {
        setError('Valid email is required');
        setIsSubmitting(false);
        return;
      }

      // Update profile
      await updateProfile({
        username: profileData.username.trim(),
        email: profileData.email.trim().toLowerCase(),
      });

      setSuccess('Profile updated successfully');
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!pictureUrl.trim()) {
        setError('Picture URL is required');
        setIsSubmitting(false);
        return;
      }

      // Simple URL validation
      try {
        new URL(pictureUrl);
      } catch (e) {
        setError('Please enter a valid URL');
        setIsSubmitting(false);
        return;
      }

      // Update profile picture
      await updateProfilePicture(pictureUrl.trim());

      setSuccess('Profile picture updated successfully');
      setOpenPictureDialog(false);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update profile picture. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.profilePicture}
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                fontSize: 40,
                mr: 3,
              }}
            >
              {!user.profilePicture && user.username.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: -8, 
                right: 16, 
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
              onClick={handleOpenPictureDialog}
              size="small"
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              onClick={handleOpenEditDialog}
              sx={{ mt: 1 }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography>{user.email}</Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography>Username: {user.username}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DateRangeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography>
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Activity
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RateReviewIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
                <Typography variant="h5">{stats.reviewsCount}</Typography>
              </Box>
              <Typography variant="body1">Reviews Written</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TheatersIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
                <Typography variant="h5">{stats.watchlistCount}</Typography>
              </Box>
              <Typography variant="body1">Movies in Watchlist</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <VisibilityIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
                <Typography variant="h5">
                  {stats.reviewsCount > 0
                    ? `${((stats.reviewsCount / (stats.reviewsCount + stats.watchlistCount)) * 100).toFixed(0)}%`
                    : '0%'}
                </Typography>
              </Box>
              <Typography variant="body1">Watched vs. Watchlist</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={profileData.username}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Picture Dialog */}
      <Dialog open={openPictureDialog} onClose={handleClosePictureDialog} fullWidth maxWidth="sm">
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 2 }}>
            <Avatar
              src={pictureUrl}
              sx={{
                width: 120,
                height: 120,
                fontSize: 60,
              }}
            >
              {!pictureUrl && user.username.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
          
          <TextField
            fullWidth
            margin="normal"
            label="Image URL"
            name="pictureUrl"
            value={pictureUrl}
            onChange={handlePictureUrlChange}
            placeholder="https://example.com/your-image.jpg"
            helperText="Enter a direct URL to an image"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, mb: 1 }}>
            Or upload an image file:
          </Typography>
          
          <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 3, borderRadius: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={imageLoading}
              >
                {imageLoading ? <CircularProgress size={24} /> : 'Choose File'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center">
                Supported formats: JPG, PNG, GIF • Max size: 5MB
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePictureDialog} disabled={isSubmitting || imageLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleProfilePictureSubmit}
            color="primary"
            variant="contained"
            disabled={isSubmitting || imageLoading}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 