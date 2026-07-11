package com.careernexus;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
public class DbCleanTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void cleanDb() {
        System.out.println(">>> CLEANING ALL DATABASE DUMMY DATA...");
        jdbcTemplate.execute("TRUNCATE TABLE chat_messages, notifications, job_applications, mentorship_requests, " +
                "interview_experiences, resumes, jobs, student_social_links, student_profiles, " +
                "alumni_social_links, alumni_profiles, hr_profiles, admin_profiles, audit_logs, " +
                "users, companies, student_projects, student_languages, student_internships, " +
                "student_certifications, student_achievements, saved_jobs, job_skills, job_requirements, " +
                "job_eligibility, job_benefits, event_registrations, events, alumni_projects, " +
                "alumni_certifications, alumni_languages CASCADE;");
        System.out.println(">>> DATABASE CLEANED SUCCESSFULLY!");
    }
}
