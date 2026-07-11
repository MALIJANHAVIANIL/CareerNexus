package com.careernexus.controller;

import com.careernexus.dto.ChatMessageDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDTO.ChatResponse> sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChatMessageDTO.ChatRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(userDetails.getId(), request));
    }

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<List<ChatMessageDTO.ChatResponse>> getChatHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long otherUserId) {
        return ResponseEntity.ok(chatService.getChatHistory(userDetails.getId(), otherUserId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatMessageDTO.ConversationResponse>> getConversations(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatService.getConversations(userDetails.getId()));
    }
}
