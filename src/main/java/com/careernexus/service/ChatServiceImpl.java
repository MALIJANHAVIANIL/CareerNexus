package com.careernexus.service;

import com.careernexus.dto.ChatMessageDTO;
import com.careernexus.entity.ChatMessage;
import com.careernexus.entity.NotificationType;
import com.careernexus.entity.User;
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
}
