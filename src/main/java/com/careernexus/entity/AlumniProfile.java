package com.careernexus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Current company is required")
    @Column(name = "current_company", nullable = false)
    private String currentCompany;

    @NotBlank(message = "Current role is required")
    @Column(name = "job_role", nullable = false)
    private String currentRole;

    @Min(value = 1900, message = "Graduation year must be valid")
    @Column(name = "graduation_year", nullable = false)
    private Integer graduationYear;

    @NotBlank(message = "Department is required")
    @Column(nullable = false)
    private String department;

    @Column(name = "industry")
    private String industry;

    @Builder.Default
    @OneToMany(
            mappedBy = "mentor",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<MentorshipRequest> mentorshipRequests = new ArrayList<>();
}