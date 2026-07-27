import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth, useUser } from '@clerk/react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

const CreateEventPage = () => {
  const { getToken } = useAuth();
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

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

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
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate('/', { replace: true });
      return;
    }

    const fetchEventForEdit = async () => {
      try {
        setPageLoading(true);
        setErrorMsg('');

        const data = await apiRequest(`/api/events/${id}`);

        const loggedInUserEmail =
          user?.primaryEmailAddress?.emailAddress?.toLowerCase();

        const eventCreatorEmail =
          data.user_email?.toLowerCase();

        if (
          !loggedInUserEmail ||
          loggedInUserEmail !== eventCreatorEmail
        ) {
          navigate('/', { replace: true });
          return;
        }

        setTitle(data.title || '');
        setDescription(data.description || '');
        setImg(data.img || '');
        setWebsite(data.website || '');
        setLocation(data.location || '');
        setIsImportant(Boolean(data.isImportant));

        const dateTimeParts = splitDateTime(
          data.date || data.last_date
        );

        setEventDate(dateTimeParts.date);
        setEventTime(dateTimeParts.time);
      } catch (error) {
        console.error('Error loading event for edit:', error);

        setErrorMsg(
          error.message || 'Server error while loading event'
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchEventForEdit();
  }, [
    id,
    isEditMode,
    isLoaded,
    isSignedIn,
    user,
    navigate,
  ]);

  const normalizeWebsiteUrl = (url) => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) return '';

    const urlWithProtocol =
      trimmedUrl.startsWith('http://') ||
      trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    try {
      const parsedUrl = new URL(urlWithProtocol);

      if (
        parsedUrl.protocol !== 'http:' &&
        parsedUrl.protocol !== 'https:'
      ) {
        return '';
      }

      return parsedUrl.toString();
    } catch {
      return '';
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !website.trim() ||
      !location.trim() ||
      !eventDate ||
      !eventTime
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const normalizedWebsite = normalizeWebsiteUrl(website);

    if (!normalizedWebsite) {
      setErrorMsg('Please enter a valid website URL.');
      return;
    }

    const combinedEventDate = `${eventDate}T${eventTime}`;

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      img,
      website: normalizedWebsite,
      location: location.trim(),
      isImportant,
      last_date: combinedEventDate,
    };

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const endpoint = isEditMode
        ? `/api/events/update/${id}`
        : '/api/events/create';

      const method = isEditMode ? 'PUT' : 'POST';

      await apiRequest(
        endpoint,
        {
          method,
          body: JSON.stringify(eventData),
        },
        getToken
      );

      navigate('/');
    } catch (error) {
      console.error('Error sending event data:', error);

      setErrorMsg(
        error.message || 'Server error while saving event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    const maxImageSize = 5 * 1024 * 1024;

    if (!allowedImageTypes.includes(file.type)) {
      setErrorMsg(
        'Only JPG, PNG and WebP images are allowed.'
      );
      event.target.value = '';
      return;
    }

    if (file.size > maxImageSize) {
      setErrorMsg('The image must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    try {
      setErrorMsg('');

      const extensionByType = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };

      const fileExtension = extensionByType[file.type];
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('event-img')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('event-img')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Could not create the image URL.');
      }

      setImg(urlData.publicUrl);
    } catch (error) {
      console.error('Image upload error:', error);

      setErrorMsg(
        error.message || 'Image upload failed.'
      );
    }
  };

  if (!isLoaded) {
    return (
      <div className="auth-status-wrapper">
        <div className="auth-status-card">
          <div className="auth-loader" />

          <h2 className="auth-status-title">
            טוען נתוני משתמש...
          </h2>

          <p className="auth-status-text">אנא המתן רגע</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (pageLoading) {
    return (
      <div className="auth-status-wrapper">
        <div className="auth-status-card">
          <div className="auth-loader" />

          <h2 className="auth-status-title">
            Loading event...
          </h2>

          <p className="auth-status-text">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <div className="create-card">
        <h1 className="create-title">
          {isEditMode
            ? 'Update Event'
            : 'Create a New Event'}
        </h1>

        {errorMsg && (
          <p className="form-error-message">{errorMsg}</p>
        )}

        <form
          onSubmit={submitForm}
          className="create-form"
        >
          <div className="form-div">
            <label htmlFor="event-title">
              Event Title
            </label>

            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Music Festival"
              maxLength={120}
              required
            />
          </div>

          <div className="form-div">
            <label htmlFor="event-description">
              Event Description
            </label>

            <textarea
              id="event-description"
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Tell us about your event..."
              maxLength={3000}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-div">
              <label htmlFor="event-website">
                Website Link
              </label>

              <input
                id="event-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myevent.com"
                maxLength={2048}
                required
              />
            </div>

            <div className="form-div">
              <label htmlFor="event-location">
                Location
              </label>

              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="E.g. Tel Aviv, Israel"
                maxLength={200}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-div">
              <label htmlFor="event-date">Date</label>

              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) =>
                  setEventDate(e.target.value)
                }
                required
              />
            </div>

            <div className="form-div">
              <label htmlFor="event-time">Time</label>

              <input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) =>
                  setEventTime(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="important-row">
            <label htmlFor="event-important">
              Is Important
            </label>

            <input
              id="event-important"
              type="checkbox"
              checked={isImportant}
              onChange={(e) =>
                setIsImportant(e.target.checked)
              }
            />
          </div>

          <div className="form-div">
            <label htmlFor="event-image">
              Event Image
            </label>

            <input
              id="event-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
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

export default CreateEventPage;