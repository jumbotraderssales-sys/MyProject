import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const Notifications = () => {
  const { notifications, markNotificationAsRead } = useDatabase();

  return (
    <div className="notifications">
      <h3>Recent Notifications</h3>
      <div className="notification-list">
        {notifications.slice(0, 5).map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <FontAwesomeIcon icon={faBell} />
            <div className="notification-content">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{new Date(notification.timestamp).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;