package com.careernexus.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(nullable = false)
    private String title;

    @Column(name = "tech_stack")
    private String techStack;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String link;
}
