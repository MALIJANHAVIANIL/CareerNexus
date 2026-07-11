package com.careernexus;

import com.careernexus.dto.*;
import com.careernexus.entity.*;
import com.careernexus.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class EndToEndVerificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private AlumniProfileRepository alumniProfileRepository;

    @Autowired
    private HrProfileRepository hrProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private InterviewExperienceRepository interviewExperienceRepository;

    @Autowired
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private static String studentToken;
    private static Long studentUserId;
    
    private static String alumniToken;
    private static Long alumniUserId;
    
    private static String hrToken;
    private static Long hrUserId;
    
    private static String adminToken;
    private static Long adminUserId;

    private static Long companyId;
    private static Long jobId;
    private static Long resumeId;
    private static Long applicationId;
    private static Long interviewExperienceId;
    private static Long mentorshipRequestId;
    private static Long notificationId;

    private static final String studentEmail = "student_verify_" + System.currentTimeMillis() + "@college.edu";
    private static final String alumniEmail = "alumni_verify_" + System.currentTimeMillis() + "@college.edu";
    private static final String hrEmail = "hr_verify_" + System.currentTimeMillis() + "@college.edu";
    private static final String companyName = "Verify Corp_" + System.currentTimeMillis();
    private static final String rollNumber = "R_" + System.currentTimeMillis();

    @Test
    @Order(1)
    public void testAuthentication() throws Exception {
        System.out.println(">>> 1. AUTHENTICATION VERIFICATION");

        // A. Register Student (starts verified)
        AuthDTO.RegisterRequest studentReg = new AuthDTO.RegisterRequest(studentEmail, "password123", "Verify Student", Role.STUDENT);
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentReg)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthDTO.AuthResponse studentAuth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthDTO.AuthResponse.class);
        assertNotNull(studentAuth.token());
        studentToken = "Bearer " + studentAuth.token();
        
        User studentUserObj = userRepository.findByEmail(studentEmail).orElseThrow();
        studentUserId = studentUserObj.getId();

        // B. Login Student
        AuthDTO.LoginRequest studentLogin = new AuthDTO.LoginRequest(studentEmail, "password123");
        res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        studentAuth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthDTO.AuthResponse.class);
        assertNotNull(studentAuth.token());

        // C. Register Alumni (not verified initially)
        AuthDTO.RegisterRequest alumniReg = new AuthDTO.RegisterRequest(alumniEmail, "password123", "Verify Alumni", Role.ALUMNI);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alumniReg)))
                .andExpect(status().isOk());
        
        User alumniUserObj = userRepository.findByEmail(alumniEmail).orElseThrow();
        alumniUserId = alumniUserObj.getId();

        // D. Verify Alumni cannot login
        AuthDTO.LoginRequest alumniLogin = new AuthDTO.LoginRequest(alumniEmail, "password123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alumniLogin)))
                .andExpect(status().isBadRequest()); // waiting for TPO approval

        // E. Login Admin (tpo@college.edu)
        AuthDTO.LoginRequest adminLogin = new AuthDTO.LoginRequest("tpo@college.edu", "Admin@123");
        res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthDTO.AuthResponse adminAuth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthDTO.AuthResponse.class);
        adminToken = "Bearer " + adminAuth.token();
        
        User adminUserObj = userRepository.findByEmail("tpo@college.edu").orElseThrow();
        adminUserId = adminUserObj.getId();

        // F. Admin approves Alumni
        mockMvc.perform(post("/api/tpo/approve-alumni/" + alumniUserId)
                .header("Authorization", adminToken))
                .andExpect(status().isOk());

        // G. Login Alumni succeeds
        res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alumniLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthDTO.AuthResponse alumniAuth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthDTO.AuthResponse.class);
        alumniToken = "Bearer " + alumniAuth.token();

        // H. Register HR (not verified initially)
        AuthDTO.RegisterRequest hrReg = new AuthDTO.RegisterRequest(hrEmail, "password123", "Verify HR", Role.HR);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hrReg)))
                .andExpect(status().isOk());

        User hrUserObj = userRepository.findByEmail(hrEmail).orElseThrow();
        hrUserId = hrUserObj.getId();

        // I. Verify HR cannot login
        AuthDTO.LoginRequest hrLogin = new AuthDTO.LoginRequest(hrEmail, "password123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hrLogin)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(2)
    public void testStudentProfile() throws Exception {
        System.out.println(">>> 2. STUDENT PROFILE VERIFICATION");

        // Fetch profile
        MvcResult res = mockMvc.perform(get("/api/users/profile/student")
                .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andReturn();
        ProfileDTO.StudentProfileResponse profile = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.StudentProfileResponse.class);
        assertEquals(studentUserId, profile.id());

        // Update profile
        ProfileDTO.StudentProfileRequest request = new ProfileDTO.StudentProfileRequest(
                rollNumber, "Computer Science", 9.5, 2026, "Java, Spring", "Summary test",
                "[]", "[]", "[\"English\"]", "[]", "{}", "resume.pdf", "1.2 MB", "07/07/2026"
        );
        res = mockMvc.perform(put("/api/users/profile/student")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();
        
        profile = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.StudentProfileResponse.class);
        assertEquals(rollNumber, profile.rollNumber());
        assertEquals("Computer Science", profile.department());
        assertEquals(9.5, profile.cgpa());
    }

    @Test
    @Order(3)
    public void testCompanyModule() throws Exception {
        System.out.println(">>> 3. COMPANY MODULE VERIFICATION");

        CompanyDTO.CompanyRequest req = new CompanyDTO.CompanyRequest(companyName, "https://verify.corp.com", "Verifier company", "Software");
        MvcResult res = mockMvc.perform(post("/api/companies")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        CompanyDTO.CompanyResponse company = objectMapper.readValue(res.getResponse().getContentAsString(), CompanyDTO.CompanyResponse.class);
        assertNotNull(company.id());
        companyId = company.id();

        // Get all companies
        mockMvc.perform(get("/api/companies")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(4)
    public void testHRProfile() throws Exception {
        System.out.println(">>> 4. HR PROFILE & ASSIGNMENT VERIFICATION");

        // Assign HR to Company (which should also verify HR)
        TpoDTO.HrAssignmentRequest assign = new TpoDTO.HrAssignmentRequest(hrUserId, companyId);
        mockMvc.perform(post("/api/tpo/hr/assign")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assign)))
                .andExpect(status().isOk());

        // Login HR should now succeed
        AuthDTO.LoginRequest hrLogin = new AuthDTO.LoginRequest(hrEmail, "password123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hrLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthDTO.AuthResponse hrAuth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthDTO.AuthResponse.class);
        hrToken = "Bearer " + hrAuth.token();

        // Get HR profile
        res = mockMvc.perform(get("/api/users/profile/hr")
                .header("Authorization", hrToken))
                .andExpect(status().isOk())
                .andReturn();
        ProfileDTO.HrProfileResponse hrProfile = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.HrProfileResponse.class);
        assertEquals(companyId, hrProfile.companyId());

        // Update HR profile
        ProfileDTO.HrProfileRequest updateReq = new ProfileDTO.HrProfileRequest(companyId, companyName, "Senior HR Recruiter");
        res = mockMvc.perform(put("/api/users/profile/hr")
                .header("Authorization", hrToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andReturn();
        hrProfile = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.HrProfileResponse.class);
        assertEquals("Senior HR Recruiter", hrProfile.designation());
    }

    @Test
    @Order(5)
    public void testAlumniProfile() throws Exception {
        System.out.println(">>> 5. ALUMNI PROFILE VERIFICATION");

        // Get Alumni profile
        MvcResult res = mockMvc.perform(get("/api/users/profile/alumni")
                .header("Authorization", alumniToken))
                .andExpect(status().isOk())
                .andReturn();
        ProfileDTO.AlumniProfileResponse alumni = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.AlumniProfileResponse.class);
        assertEquals(alumniUserId, alumni.id());

        // Update Alumni profile
        ProfileDTO.AlumniProfileRequest update = new ProfileDTO.AlumniProfileRequest(
                companyName, "Software Engineer", 2022, "Information Technology", "Tech",
                "Summary test", "[]", "[]", "[\"Marathi\"]", "[]", "{}"
        );
        res = mockMvc.perform(put("/api/users/profile/alumni")
                .header("Authorization", alumniToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andReturn();
        alumni = objectMapper.readValue(res.getResponse().getContentAsString(), ProfileDTO.AlumniProfileResponse.class);
        assertEquals(companyName, alumni.currentCompany());
        assertEquals("Software Engineer", alumni.currentRole());
    }

    @Test
    @Order(6)
    public void testJobModule() throws Exception {
        System.out.println(">>> 6. JOB MODULE VERIFICATION");

        JobDTO.JobEligibilityDTO eligibility = new JobDTO.JobEligibilityDTO(
                7.5, "Computer Science, Information Technology", "2026", true,
                75.0, 75.0, 0, false, "0"
        );
        JobDTO.JobRequest jobReq = new JobDTO.JobRequest(
                "Software Engineer Intern", "Exciting intern role", companyId, "Pune", "50k",
                JobType.INTERNSHIP, LocalDateTime.now().plusDays(5), eligibility
        );

        MvcResult res = mockMvc.perform(post("/api/jobs")
                .header("Authorization", hrToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobReq)))
                .andExpect(status().isOk())
                .andReturn();

        JobDTO.JobResponse job = objectMapper.readValue(res.getResponse().getContentAsString(), JobDTO.JobResponse.class);
        assertNotNull(job.id());
        jobId = job.id();

        // Get job details
        mockMvc.perform(get("/api/jobs/" + jobId)
                .header("Authorization", studentToken))
                .andExpect(status().isOk());

        // Save job
        mockMvc.perform(post("/api/jobs/" + jobId + "/save")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());

        // Get saved jobs
        mockMvc.perform(get("/api/jobs/saved")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(7)
    public void testResumeModule() throws Exception {
        System.out.println(">>> 7. RESUME MODULE VERIFICATION");

        ResumeDTO.ResumeRequest req = new ResumeDTO.ResumeRequest("https://verify.corp.com/resumes/myresume.pdf", "myresume.pdf", true);
        MvcResult res = mockMvc.perform(post("/api/resumes")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        ResumeDTO.ResumeResponse resume = objectMapper.readValue(res.getResponse().getContentAsString(), ResumeDTO.ResumeResponse.class);
        assertNotNull(resume.id());
        resumeId = resume.id();

        // Get my resumes
        mockMvc.perform(get("/api/resumes")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(8)
    public void testJobApplicationModule() throws Exception {
        System.out.println(">>> 8. JOB APPLICATION MODULE VERIFICATION");

        JobApplicationDTO.JobApplicationRequest req = new JobApplicationDTO.JobApplicationRequest(jobId, resumeId);
        MvcResult res = mockMvc.perform(post("/api/applications")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        JobApplicationDTO.JobApplicationResponse app = objectMapper.readValue(res.getResponse().getContentAsString(), JobApplicationDTO.JobApplicationResponse.class);
        assertNotNull(app.id());
        applicationId = app.id();

        // HR updates application status
        JobApplicationDTO.ApplicationStatusUpdateRequest statusUpdate = new JobApplicationDTO.ApplicationStatusUpdateRequest(
                JobApplicationStatus.SHORTLISTED, "Looks promising!"
        );
        mockMvc.perform(put("/api/applications/" + applicationId + "/status")
                .header("Authorization", hrToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk());
    }

    @Test
    @Order(9)
    public void testInterviewExperienceModule() throws Exception {
        System.out.println(">>> 9. INTERVIEW EXPERIENCE MODULE VERIFICATION");

        InterviewExperienceDTO.ExperienceRequest req = new InterviewExperienceDTO.ExperienceRequest(
                companyId, "Software Intern", "Nice interview, focused on algorithms.",
                InterviewDifficulty.MEDIUM, 3, false
        );
        MvcResult res = mockMvc.perform(post("/api/interview-experiences")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        InterviewExperienceDTO.ExperienceResponse exp = objectMapper.readValue(res.getResponse().getContentAsString(), InterviewExperienceDTO.ExperienceResponse.class);
        assertNotNull(exp.id());

        // Get experiences
        mockMvc.perform(get("/api/interview-experiences")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(10)
    public void testMentorshipModule() throws Exception {
        System.out.println(">>> 10. MENTORSHIP MODULE VERIFICATION");

        MentorshipDTO.MentorshipRequestDTO req = new MentorshipDTO.MentorshipRequestDTO(alumniUserId, "Please mentor me in Spring Boot!");
        MvcResult res = mockMvc.perform(post("/api/mentorship/request")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        MentorshipDTO.MentorshipResponseDTO request = objectMapper.readValue(res.getResponse().getContentAsString(), MentorshipDTO.MentorshipResponseDTO.class);
        assertNotNull(request.id());
        mentorshipRequestId = request.id();

        // Respond to Request
        MentorshipDTO.MentorshipActionDTO action = new MentorshipDTO.MentorshipActionDTO(MentorshipStatus.APPROVED, "Sure, happy to guide you!");
        mockMvc.perform(put("/api/mentorship/request/" + mentorshipRequestId + "/respond")
                .header("Authorization", alumniToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isOk());
    }

    @Test
    @Order(11)
    public void testChatModule() throws Exception {
        System.out.println(">>> 11. CHAT MODULE VERIFICATION");

        ChatMessageDTO.ChatRequest req = new ChatMessageDTO.ChatRequest(alumniUserId, "Hello mentor!");
        mockMvc.perform(post("/api/chat/send")
                .header("Authorization", studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Get chat history
        mockMvc.perform(get("/api/chat/history/" + alumniUserId)
                .header("Authorization", studentToken))
                .andExpect(status().isOk());

        // Get conversations
        mockMvc.perform(get("/api/chat/conversations")
                .header("Authorization", alumniToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(12)
    public void testNotificationModule() throws Exception {
        System.out.println(">>> 12. NOTIFICATION MODULE VERIFICATION");

        MvcResult res = mockMvc.perform(get("/api/notifications")
                .header("Authorization", alumniToken))
                .andExpect(status().isOk())
                .andReturn();
        
        java.util.List<?> list = objectMapper.readValue(res.getResponse().getContentAsString(), java.util.List.class);
        assertFalse(list.isEmpty());

        Map<?, ?> notification = (Map<?, ?>) list.get(0);
        Number idNum = (Number) notification.get("id");
        notificationId = idNum.longValue();

        // Mark as read
        mockMvc.perform(put("/api/notifications/" + notificationId + "/read")
                .header("Authorization", alumniToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(13)
    public void testAuditLogAndTpoModule() throws Exception {
        System.out.println(">>> 13. AUDIT LOG & TPO MODULE VERIFICATION");

        // Fetch Audit Logs
        mockMvc.perform(get("/api/audit-logs")
                .header("Authorization", adminToken))
                .andExpect(status().isOk());

        // Fetch TPO stats
        mockMvc.perform(get("/api/tpo/stats")
                .header("Authorization", adminToken))
                .andExpect(status().isOk());

        // Download Report
        mockMvc.perform(get("/api/tpo/reports/download?type=GENERAL")
                .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }
}
