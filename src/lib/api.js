import axios from 'axios';
export const api = axios.create({ baseURL: '/api' });

const aiBaseUrl = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000';

// AI Service API
export const aiApi = axios.create({
  baseURL: aiBaseUrl,
  timeout: 30000, // 30 seconds timeout for image processing
});

export const detectFlood = async (image) => {
  const formData = new FormData();
  formData.append('file', image);

  try {
    console.log('Sending image to AI service:', image.name);
    const response = await aiApi.post('/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('AI Service Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error detecting flood:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

// Social Media Posts API
export const getSocialPosts = async (limit = 2) => {
  try {
    const response = await api.get(`/social-posts?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching social posts:', error);
    throw error;
  }
};

export const getAllSocialPosts = async (limit = 10) => {
  try {
    const response = await api.get(`/social-posts?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all social posts:', error);
    throw error;
  }
};

export const scanSocialPosts = async (limit = 3, offset = 0) => {
  try {
    const response = await api.post('/social-posts/scan', { limit, offset });
    return response.data;
  } catch (error) {
    console.error('Error scanning social posts:', error);
    throw error;
  }
};

export const getTotalPostsCount = async () => {
  try {
    const response = await api.get('/social-posts/count');
    return response.data;
  } catch (error) {
    console.error('Error getting posts count:', error);
    throw error;
  }
};

export const manualUpload = async (platform, username, content, location, image) => {
  const formData = new FormData();
  formData.append('platform', platform);
  formData.append('username', username);
  formData.append('content', content);
  formData.append('location', location);
  if (image) {
    formData.append('image', image);
  }

  try {
    const response = await api.post('/manual-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading post:', error);
    throw error;
  }
};
