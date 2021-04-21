import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';

export const generateToken = (id, email, username, type) => {
  return jwt.sign(
    {
      id: id,
      email: email,
      username: username,
      type: type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
};
const week = ['일', '월', '화', '수', '목', '금', '토'];
export const getDayOfWeek = date => week[new Date(date).getDay()];

export const clubListEllipsis = (body, limit) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < limit || limit === -1
    ? filtered
    : `${filtered.slice(0, limit)}...`;
};

export const checkDateVsNow = (date, isNew) => {
  if (isNew) {
    return (
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
  } else {
    return (
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }
};
export const checkEnd = (startDate, times) => {
  return (
    new Date(startDate + ((times - 1) * 7 + 1) * 24 * 60 * 60 * 1000) >
    new Date()
  );
};

export const deepCopy = obj => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const result = Array.isArray(obj) ? [] : {};

  for (let key of Object.keys(obj)) {
    result[key] = deepCopy(obj[key]);
  }

  return result;
};
