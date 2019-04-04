import React, { Component } from 'react';
import { NotificationComponent } from './index';
import { Container } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';
import { notificationTypes } from '../types';

class NotificationListComponent extends Component {
  render () {
    const { notifications, viewNotification } = this.props;

    const variant = notificationType => {
      if (notificationType === notificationTypes.ERROR) return 'danger';
      if (notificationType === notificationTypes.TX) return 'secondary';
    }

    return (
      <Container>
        {notifications.map(n => {
          const n_variant = variant(n.type)
          return (
            <Alert key={n.id} variant={n_variant} dismissible onClose={() => viewNotification(n.id)}>
              <NotificationComponent type={n.type} message={n.message} tx={n.tx} mined={n.mined} />
            </Alert>
          )
          }
        )}
      </Container>
    )
  }
}

export default NotificationListComponent;
