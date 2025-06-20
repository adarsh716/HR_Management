import apiClient from '../service/apiclient';

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const registerUser = async ({ fullname, email, password, role }) => {
  try {
    console.log('Registration response:', { fullname, email, password, role });
    const response = await apiClient.post('/api/auth/register', { fullname, email, password, role });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response ? error.response.data : error.message;
  }
};

export const getAllCandidates = async () => {
  try {
    const response = await apiClient.get('/api/candidate/fetch');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const createCandidate = async ({ name, email, phone, position, experience, resume }) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("position", position);
    formData.append("experience", experience);
    if (resume) formData.append("resume", resume);

    const response = await apiClient.post('/api/candidate/create', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};