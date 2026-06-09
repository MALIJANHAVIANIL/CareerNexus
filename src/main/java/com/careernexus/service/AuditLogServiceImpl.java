package com.careernexus.service;

import com.careernexus.dto.AuditLogDTO;
import com.careernexus.entity.AuditLog;
import com.careernexus.entity.User;
import com.careernexus.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void log(String action, User performedBy, String details) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO.AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(log -> new AuditLogDTO.AuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getPerformedBy() != null ? log.getPerformedBy().getId() : null,
                        log.getPerformedBy() != null ? log.getPerformedBy().getEmail() : "SYSTEM",
                        log.getTimestamp(),
                        log.getDetails()
                ))
                .collect(Collectors.toList());
    }
}
