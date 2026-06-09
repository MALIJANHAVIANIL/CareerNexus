package com.careernexus.service;

import com.careernexus.dto.AuditLogDTO;
import com.careernexus.entity.User;

import java.util.List;

public interface AuditLogService {
    void log(String action, User performedBy, String details);
    List<AuditLogDTO.AuditLogResponse> getAllLogs();
}
