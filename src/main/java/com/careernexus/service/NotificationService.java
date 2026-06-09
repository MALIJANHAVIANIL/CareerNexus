package com.careernexus.service;

import com.careernexus.dto.NotificationDTO;
import com.careernexus.entity.NotificationType;
import com.careernexus.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User recipient, String message, NotificationType type);
    List<NotificationDTO.NotificationResponse> getUserNotifications(Long userId);
    void markAsRead(Long userId, Long notificationId);
}
