package com.careernexus.service;

import com.careernexus.dto.ChatMessageDTO;
import com.careernexus.entity.ChatMessage;
import com.careernexus.entity.NotificationType;
import com.careernexus.entity.User;
import com.careernexus.entity.Role;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.ChatMessageRepository;
import com.careernexus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatServiceImpl(ChatMessageRepository chatMessageRepository, UserRepository userRepository,
                           NotificationService notificationService) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private ChatMessageDTO.ChatResponse mapToResponse(ChatMessage msg) {
        return new ChatMessageDTO.ChatResponse(
                msg.getId(),
                msg.getSender().getId(),
                msg.getSender().getFullName(),
                msg.getRecipient().getId(),
                msg.getRecipient().getFullName(),
                msg.getContent(),
                msg.getTimestamp()
        );
    }

    @Override
    @Transactional
    public ChatMessageDTO.ChatResponse sendMessage(Long senderId, ChatMessageDTO.ChatRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found with ID: " + senderId));

        User recipient = userRepository.findById(request.recipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found with ID: " + request.recipientId()));

        ChatMessage chatMessage = ChatMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .content(request.content())
                .build();

        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Notify Recipient
        notificationService.createNotification(
                recipient,
                "New message from " + sender.getFullName() + ": " + (request.content().length() > 30 ? request.content().substring(0, 27) + "..." : request.content()),
                NotificationType.CHAT
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO.ChatResponse> getChatHistory(Long userId, Long otherUserId) {
        if (!userRepository.existsById(userId) || !userRepository.existsById(otherUserId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return chatMessageRepository.findChatHistory(userId, otherUserId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO.ConversationResponse> getConversations(Long userId) {
        List<ChatMessage> allUserMessages = chatMessageRepository.findBySenderIdOrRecipientId(userId);

        java.util.Set<Long> otherUserIds = allUserMessages.stream()
                .map(m -> m.getSender().getId().equals(userId) ? m.getRecipient().getId() : m.getSender().getId())
                .collect(Collectors.toSet());

        return otherUserIds.stream().map(otherId -> {
            User otherUser = userRepository.findById(otherId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + otherId));

            List<ChatMessageDTO.ChatResponse> msgs = getChatHistory(userId, otherId);

            Long studentId = null;
            String studentName = "";
            String studentTitle = "";
            String studentAvatar = "";

            Long mentorId = null;
            String mentorName = "";
            String mentorTitle = "";
            String mentorAvatar = "";

            if (otherUser.getRole() == Role.STUDENT) {
                studentId = otherUser.getId();
                studentName = otherUser.getFullName();
                studentTitle = otherUser.getStudentProfile() != null ? otherUser.getStudentProfile().getDepartment() : "Student";
                studentAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150";
            } else {
                mentorId = otherUser.getId();
                mentorName = otherUser.getFullName();
                mentorTitle = otherUser.getAlumniProfile() != null ? otherUser.getAlumniProfile().getCurrentRole() + " at " + otherUser.getAlumniProfile().getCurrentCompany() : "Mentor";
                mentorAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
            }

            User currentUser = userRepository.findById(userId).orElse(null);
            if (currentUser != null) {
                if (currentUser.getRole() == Role.STUDENT) {
                    studentId = currentUser.getId();
                    studentName = currentUser.getFullName();
                    studentTitle = currentUser.getStudentProfile() != null ? currentUser.getStudentProfile().getDepartment() : "Student";
                    studentAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150";
                } else {
                    mentorId = currentUser.getId();
                    mentorName = currentUser.getFullName();
                    mentorTitle = currentUser.getAlumniProfile() != null ? currentUser.getAlumniProfile().getCurrentRole() + " at " + currentUser.getAlumniProfile().getCurrentCompany() : "Mentor";
                    mentorAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
                }
            }

            return new ChatMessageDTO.ConversationResponse(
                    "chat-" + otherId,
                    studentId,
                    studentName,
                    studentAvatar,
                    studentTitle,
                    mentorId,
                    mentorName,
                    mentorAvatar,
                    mentorTitle,
                    msgs
            );
        }).collect(Collectors.toList());
    }
}
