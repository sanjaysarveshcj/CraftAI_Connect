// services/meshyService.js

const axios = require('axios');
require('dotenv').config();

const MESHY_BASE = 'https://api.meshy.ai';

const createTextTo3DPreview = async (prompt, options = {}) => {
  const url = `${MESHY_BASE}/openapi/v2/text-to-3d`;
  const body = {
    mode: 'preview',
    prompt: prompt,
    // optional options you can pass: art_style, seed, should_remesh, topology, etc
    ...options
  };

  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;  // should contain { result: <task_id> } on success
};

const getTextTo3DTaskStatus = async (taskId) => {
  const url = `${MESHY_BASE}/openapi/v2/text-to-3d/${taskId}`;
  const resp = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.MESHY_API_KEY}`
    }
  });
  return resp.data;  // includes status, model_urls, etc
};

module.exports = {
  createTextTo3DPreview,
  getTextTo3DTaskStatus
};
