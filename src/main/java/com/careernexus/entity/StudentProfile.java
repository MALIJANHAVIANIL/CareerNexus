package com.careernexus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    @Column
    private String department;

    @Column
    private String branch;

    @Column
    private Double cgpa;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "resume_name")
    private String resumeName;

    @Column(name = "resume_size")
    private String resumeSize;

    @Column(name = "resume_uploaded")
    private String resumeUploaded;

    @Column
    private String phone;

    @Column
    private String address;

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentProject> projects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentInternship> internships = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentCertification> certifications = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentLanguage> languages = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentAchievement> achievements = new ArrayList<>();

    @OneToOne(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudentSocialLink socialLink;

    @Builder.Default
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resume> resumes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobApplication> jobApplications = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavedJob> savedJobs = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventRegistration> eventRegistrations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorshipRequest> mentorshipRequests = new ArrayList<>();
}
