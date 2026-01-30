import React from 'react';
import { useParams } from 'react-router-dom';

const UserDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="card">
      <h2>User Details</h2>
      <p>Viewing user with ID: {id}</p>
      <p>User details functionality coming soon.</p>
    </div>
  );
};

export default UserDetailPage;