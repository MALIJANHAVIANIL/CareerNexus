package com.careernexus.service;

import com.careernexus.dto.ChatMessageDTO;

import java.util.List;

public interface ChatService {
    ChatMessageDTO.ChatResponse sendMessage(Long senderId, ChatMessageDTO.ChatRequest request);
    List<ChatMessageDTO.ChatResponse> getChatHistory(Long userId, Long otherUserId);
    List<ChatMessageDTO.ConversationResponse> getConversations(Long userId);
}
