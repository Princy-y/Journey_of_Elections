const CACHE_PREFIX = 'chunav_';

export const setCache = (key, value, ttlMinutes) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlMinutes * 60000,
  };
  sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
};

export const getCache = (key) => {
  const itemStr = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!itemStr) return null;
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
  return item.value;
};

export const clearCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
};
