 const getAuthUserId = (): string | null => {
  const userData = localStorage.getItem('authUser');
  if (!userData) return null;
  const user = JSON.parse(userData);
  return user._id;
};


export default getAuthUserId;
