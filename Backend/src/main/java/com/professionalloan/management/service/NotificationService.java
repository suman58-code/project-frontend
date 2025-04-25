package com.professionalloan.management.service;

import com.professionalloan.management.model.Notification;
import com.professionalloan.management.model.User;
import com.professionalloan.management.model.ApplicationStatus;
import com.professionalloan.management.repository.NotificationRepository;
import com.professionalloan.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new notification
    public Notification createNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // Get user's notifications
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    // Mark notification as read
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    // Create loan status notification
    public void notifyLoanStatus(Long userId, String applicationId, ApplicationStatus status) {
        String message = String.format("Your loan application %s has been %s", applicationId, status.name().toLowerCase());
        createNotification(userId, message, "STATUS_UPDATE");
    }

    // Create EMI due notification
    public void notifyEMIDue(Long userId, String applicationId, int emiNumber) {
        String message = String.format("EMI #%d for loan %s is due soon", emiNumber, applicationId);
        createNotification(userId, message, "EMI_DUE");
    }

    // Create EMI overdue notification
    public void notifyEMIOverdue(Long userId, String applicationId, int emiNumber) {
        String message = String.format("EMI #%d for loan %s is overdue", emiNumber, applicationId);
        createNotification(userId, message, "EMI_OVERDUE");
    }
} 