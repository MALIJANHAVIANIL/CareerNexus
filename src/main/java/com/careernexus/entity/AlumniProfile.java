package com.careernexus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "alumni_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private String prn;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "job_role")
    private String currentRole;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column
    private String department;

    @Column(name = "industry")
    private String industry;

    @Column
    private String experience;

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

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Builder.Default
    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlumniProject> projects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlumniCertification> certifications = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlumniLanguage> languages = new ArrayList<>();

    @OneToOne(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private AlumniSocialLink socialLink;

    @Builder.Default
    @OneToMany(
            mappedBy = "mentor",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<MentorshipRequest> mentorshipRequests = new ArrayList<>();
}