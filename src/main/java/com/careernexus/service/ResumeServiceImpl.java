package com.careernexus.service;

import com.careernexus.dto.ResumeDTO;
import com.careernexus.entity.Resume;
import com.careernexus.entity.StudentProfile;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.exception.UnauthorizedException;
import com.careernexus.repository.ResumeRepository;
import com.careernexus.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ResumeServiceImpl(
            ResumeRepository resumeRepository,
            StudentProfileRepository studentProfileRepository) {

        this.resumeRepository = resumeRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    private ResumeDTO.ResumeResponse mapToResponse(Resume resume) {

        return new ResumeDTO.ResumeResponse(
                resume.getId(),
                resume.getResumeUrl(),
                resume.getFileName(),
                resume.isPrimary(),
                resume.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public ResumeDTO.ResumeResponse createResume(
            Long studentUserId,
            ResumeDTO.ResumeRequest request) {

        StudentProfile studentProfile =
                studentProfileRepository.findById(studentUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Student profile not found"));

        Resume resume = Resume.builder()
                .studentProfile(studentProfile)
                .resumeUrl(request.resumeUrl())
                .fileName(request.fileName())
                .isPrimary(request.isPrimary())
                .build();

        Resume saved = resumeRepository.save(resume);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeDTO.ResumeResponse> getMyResumes(Long studentUserId) {

        StudentProfile studentProfile =
                studentProfileRepository.findById(studentUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Student profile not found"));

        return resumeRepository.findAll()
                .stream()
                .filter(r -> r.getStudentProfile().getId().equals(studentProfile.getId()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeDTO.ResumeResponse getResume(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resume not found"));

        return mapToResponse(resume);
    }

    @Override
    @Transactional
    public void deleteResume(Long studentUserId, Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resume not found"));

        if (!resume.getStudentProfile().getId().equals(studentUserId)) {
            throw new UnauthorizedException("You are not authorized to delete this resume");
        }

        resumeRepository.delete(resume);
    }
}