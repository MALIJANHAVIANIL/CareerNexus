package com.careernexus.service;

import com.careernexus.dto.TpoDTO;
import java.util.List;

public interface TpoService {
    TpoDTO.TpoStatsResponse getStats();
    List<TpoDTO.AlumniVerificationResponse> getPendingAlumni();
    void approveAlumni(Long userId);
    void rejectAlumni(Long userId);
    void deactivateHr(Long userId);
    void assignHr(TpoDTO.HrAssignmentRequest request);
    String generateReportCsv(String type);
    List<TpoDTO.StudentTpoResponse> getAllStudents();
    List<TpoDTO.AlumniTpoResponse> getAllAlumni();
}
