package com.careernexus.service;

import com.careernexus.dto.ProfileDTO;

public interface UserService {
    ProfileDTO.StudentProfileResponse getStudentProfile(Long userId);
    ProfileDTO.StudentProfileResponse updateStudentProfile(Long userId, ProfileDTO.StudentProfileRequest request);

    ProfileDTO.AlumniProfileResponse getAlumniProfile(Long userId);
    ProfileDTO.AlumniProfileResponse updateAlumniProfile(Long userId, ProfileDTO.AlumniProfileRequest request);

    ProfileDTO.HrProfileResponse getHrProfile(Long userId);
    ProfileDTO.HrProfileResponse updateHrProfile(Long userId, ProfileDTO.HrProfileRequest request);

    ProfileDTO.AdminProfileResponse getAdminProfile(Long userId);
    ProfileDTO.AdminProfileResponse updateAdminProfile(Long userId, ProfileDTO.AdminProfileRequest request);
}
