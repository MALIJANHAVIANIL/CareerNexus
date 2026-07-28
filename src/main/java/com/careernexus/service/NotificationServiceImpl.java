package com.careernexus.service;

import com.careernexus.dto.NotificationDTO;
import com.careernexus.entity.Notification;
import com.careernexus.entity.NotificationType;
import com.careernexus.entity.User;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.careernexus.entity.Job;
import com.careernexus.entity.JobApplication;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.careernexus.repository.UserRepository userRepository;
    private final com.careernexus.repository.HrProfileRepository hrProfileRepository;
    private final com.careernexus.repository.JobRepository jobRepository;
    private final com.careernexus.repository.JobApplicationRepository jobApplicationRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            com.careernexus.repository.UserRepository userRepository,
            com.careernexus.repository.HrProfileRepository hrProfileRepository,
            com.careernexus.repository.JobRepository jobRepository,
            com.careernexus.repository.JobApplicationRepository jobApplicationRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Override
    @Transactional
    public void createNotification(User recipient, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO.NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> new NotificationDTO.NotificationResponse(
                        n.getId(),
                        n.getRecipient().getId(),
                        n.getMessage(),
                        n.isRead(),
                        n.getType(),
                        n.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void createHrBroadcast(Long hrUserId, String message) {
        User hr = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR User not found"));
        
        com.careernexus.entity.HrProfile profile = hrProfileRepository.findByUserId(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Profile not found"));
        
        String companyName = profile.getCompany() != null ? profile.getCompany().getName() : "Partner Company";
        String announcement = String.format("[%s HR Announcement] %s", companyName, message);
        
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.careernexus.entity.Role.STUDENT && u.isActive())
                .collect(Collectors.toList());

        for (User student : students) {
            createNotification(student, announcement, NotificationType.INFO);
        }
    }

    @Override
    @Transactional
    public void scheduleOnlineTest(Long hrUserId, Long jobId, String testDate, String testTime, String testLink, String instructions) {
        User hr = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR User not found"));
        
        com.careernexus.entity.Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        
        com.careernexus.entity.HrProfile profile = hrProfileRepository.findByUserId(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Profile not found"));
        
        String companyName = profile.getCompany() != null ? profile.getCompany().getName() : "Partner Company";
        
        String testDetails = String.format(
                "[%s Assessment Alert] Online Test scheduled for '%s' on %s at %s. Link: %s. Instructions: %s",
                companyName, job.getTitle(), testDate, testTime, testLink, instructions
        );

        List<JobApplication> apps = jobApplicationRepository.findByJobId(jobId);
        for (JobApplication app : apps) {
            createNotification(app.getStudent().getUser(), testDetails, NotificationType.INFO);
        }
    }
}
