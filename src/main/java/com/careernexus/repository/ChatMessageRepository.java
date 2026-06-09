package com.careernexus.repository;

import com.careernexus.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT c FROM ChatMessage c WHERE (c.sender.id = :u1 AND c.recipient.id = :u2) OR (c.sender.id = :u2 AND c.recipient.id = :u1) ORDER BY c.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("u1") Long user1, @Param("u2") Long user2);
}
