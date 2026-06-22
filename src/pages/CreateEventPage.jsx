import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '@clerk/react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

const CreateProject = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [img, setImg] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const [lastDate, setLastDate] = useState('');
  const [lastTime, setLastTime] = useState('');

  const [pageLoading, setPageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const splitDateTime = (dateValue) => {
    if (!dateValue) {
      return {
        date: '',
        time: '',
      };
    }

    const dateObj = new Date(dateValue);

    if (Number.isNaN(dateObj.getTime())) {
      return {
        date: '',
        time: '',
      };
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  useEffect(() => {
    if (!isEditMode) return;

    const fetchEventForEdit = async () => {
      try {
        setPageLoading(true);
        setErrorMsg('');

        const data = await apiRequest(`/api/events/${id}`);

        setTitle(data.title || '');
        setDescription(data.description || '');
        setImg(data.img || '');
        setWebsite(data.website || '');
        setLocation(data.location || '');
        setIsImportant(Boolean(data.isImportant));

        const dateTimeParts = splitDateTime(data.date || data.last_date);
        setLastDate(dateTimeParts.date);
        setLastTime(dateTimeParts.time);
      } catch (error) {
        console.error('Error loading event for edit:', error);
        setErrorMsg(error.message || 'Server error while loading event');
      } finally {
        setPageLoading(false);
      }
    };

    fetchEventForEdit();
  }, [id, isEditMode]);

  const submitForm = async (e) => {
    e.preventDefault();

    const combinedLastDate =
      lastDate && lastTime
        ? `${lastDate}T${lastTime}`
        : null;

    const eventData = {
      title,
      description,
      img,
      website,
      location,
      isImportant,
      last_date: combinedLastDate,
      author: user?.fullName || 'Anonymous',
      user_email: user?.primaryEmailAddress?.emailAddress,
    };

    console.log('Data being sent to Backend:', eventData);

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const endpoint = isEditMode
        ? `/api/events/update/${id}`
        : '/api/events/create';

      const method = isEditMode ? 'PUT' : 'POST';

      const data = await apiRequest(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log(
        isEditMode ? 'Event updated successfully:' : 'Event saved successfully:',
        data
      );

      navigate('/');
    } catch (error) {
      console.error('Error sending event data:', error);
      setErrorMsg(error.message || 'Server error while saving event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('event-img')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('event-img')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setImg(publicUrl);

      console.log('Image URL:', publicUrl);
    } catch (error) {
      console.error('Image upload error:', error.message);
      alert('Image upload failed. Check the console.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="auth-status-wrapper">
        <div className="auth-status-card">
          <div className="auth-loader"></div>
          <h2 className="auth-status-title">טוען נתוני משתמש...</h2>
          <p className="auth-status-text">אנא המתן רגע</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="auth-status-wrapper">
        <div className="auth-status-card">
          <h2 className="auth-status-title">גישה מוגבלת</h2>
          <p className="auth-status-text">
            עליך להיות מחובר כדי {isEditMode ? 'לערוך אירוע' : 'ליצור אירוע'}
          </p>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="auth-status-wrapper">
        <div className="auth-status-card">
          <div className="auth-loader"></div>
          <h2 className="auth-status-title">Loading event...</h2>
          <p className="auth-status-text">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <div className="create-card">
        <h1 className="create-title">
          {isEditMode ? 'Update Event' : 'Create a New Event'}
        </h1>

        {errorMsg && (
          <p className="form-error-message">
            {errorMsg}
          </p>
        )}

        <form onSubmit={submitForm} className="create-form">
          <div className="form-div">
            <label>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Music Festival"
              required
            />
          </div>

          <div className="form-div">
            <label>Event Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your event..."
            />
          </div>

          <div className="form-row">
            <div className="form-div">
              <label>Website Link</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myevent.com"
              />
            </div>

            <div className="form-div">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g. Tel Aviv, Israel"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-div">
              <label>Last Date</label>
              <input
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
              />
            </div>

            <div className="form-div">
              <label>Last Time</label>
              <input
                type="time"
                value={lastTime}
                onChange={(e) => setLastTime(e.target.value)}
              />
            </div>
          </div>

          <div className="important-row">
            <label>Is Important</label>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            />
          </div>

          <div className="form-div">
            <label>Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {img && (
              <>
                <p className="upload-success">
                  {isEditMode
                    ? 'Current image is ready'
                    : 'Image uploaded successfully'}
                </p>

                <img
                  src={img}
                  alt="Event preview"
                  style={{
                    width: '160px',
                    marginTop: '10px',
                    borderRadius: '10px',
                  }}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            className="create-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
                ? 'Update Event'
                : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;