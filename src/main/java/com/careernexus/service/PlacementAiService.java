package com.careernexus.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PlacementAiService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String configuredApiKey;

    public PlacementAiService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> query(String queryText, String userProvidedKey, List<Map<String, String>> historyList) {
        Map<String, Object> response = new HashMap<>();
        response.put("query", queryText);

        // Resolve API key
        String apiKey = userProvidedKey;
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY");
        }
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = configuredApiKey;
        }

        // If no API Key is provided, use the Offline Rule-Based SQL Generator Fallback
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return executeRuleBasedQuery(queryText);
        }

        try {
            String systemPrompt = "You are CareerNexus AI, a helpful placement assistant chatbot. You have access to the local database.\n" +
                    "Your task is to analyze the conversation history and the user's latest query, and choose your next action.\n\n" +
                    "Choose one of the following two JSON response formats (do not include any other text or markdown block wraps):\n\n" +
                    "Format A: If you need to run a read-only SQL query against the database to answer the user's question, output:\n" +
                    "{\n" +
                    "  \"action\": \"QUERY\",\n" +
                    "  \"sql\": \"SELECT ...\"\n" +
                    "}\n\n" +
                    "Format B: If you do not need to query the database (e.g. it is a greeting, general comment, follow-up explanation, or you already have the data in context), output:\n" +
                    "{\n" +
                    "  \"action\": \"RESPOND\",\n" +
                    "  \"reply\": \"Your conversational response in markdown here\"\n" +
                    "}\n\n" +
                    "Schema details:\n" +
                    "- users (id, email, full_name, role, is_active, is_verified)\n" +
                    "  - role: 'STUDENT', 'ALUMNI', 'HR', 'ADMIN'\n" +
                    "- student_profiles (user_id, roll_number, department, branch, cgpa, graduation_year, skills)\n" +
                    "- companies (id, name, industry)\n" +
                    "- jobs (id, title, description, company_id, hr_profile_id, location, salary_range, job_type)\n" +
                    "  - job_type: 'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'\n" +
                    "- job_applications (id, job_id, student_profile_id, status, applied_at)\n" +
                    "  - status: 'APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'SELECTED', 'REJECTED' (SELECTED means placed)\n\n" +
                    "Important details:\n" +
                    "1. For company name matching or general search, use ILIKE (e.g. c.name ILIKE '%tcs%') to avoid case issues.\n" +
                    "2. Verify table and column names carefully. Only read-only SELECT queries are allowed.";

            // Build contents array for Gemini
            List<Map<String, Object>> contents = new ArrayList<>();
            boolean firstUserFound = false;

            if (historyList != null) {
                for (Map<String, String> msg : historyList) {
                    String sender = msg.get("sender");
                    String message = msg.get("message");
                    if (sender == null || message == null) continue;

                    if ("user".equals(sender)) {
                        firstUserFound = true;
                        Map<String, Object> turn = new HashMap<>();
                        turn.put("role", "user");
                        
                        String text = message;
                        if (contents.isEmpty()) {
                            text = "System Prompt:\n" + systemPrompt + "\n\nUser Input:\n" + message;
                        }
                        
                        turn.put("parts", List.of(Map.of("text", text)));
                        contents.add(turn);
                    } else if ("ai".equals(sender) && firstUserFound) {
                        Map<String, Object> turn = new HashMap<>();
                        turn.put("role", "model");
                        turn.put("parts", List.of(Map.of("text", message)));
                        contents.add(turn);
                    }
                }
            }

            // Append latest query
            Map<String, Object> latestTurn = new HashMap<>();
            latestTurn.put("role", "user");
            String text = queryText;
            if (contents.isEmpty()) {
                text = "System Prompt:\n" + systemPrompt + "\n\nUser Input:\n" + queryText;
            }
            latestTurn.put("parts", List.of(Map.of("text", text)));
            contents.add(latestTurn);

            // Step 1 call to Gemini
            String rawAiDecision = callGeminiApi(apiKey, contents);
            Map<String, String> decisionMap = objectMapper.readValue(rawAiDecision, Map.class);
            String action = decisionMap.get("action");

            if ("QUERY".equals(action)) {
                String sql = decisionMap.get("sql");
                
                // Safety checks on SQL
                String sqlClean = sql.trim().toLowerCase();
                if (!sqlClean.startsWith("select")) {
                    throw new IllegalArgumentException("Only read-only SELECT queries are permitted.");
                }
                if (sqlClean.contains("delete") || sqlClean.contains("drop") || sqlClean.contains("update") || 
                    sqlClean.contains("insert") || sqlClean.contains("truncate") || sqlClean.contains("alter")) {
                    throw new IllegalArgumentException("Unauthorized query keywords detected.");
                }

                // Execute SQL
                List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
                String dataJson = objectMapper.writeValueAsString(data);

                // Step 2 call: send SQL results back in conversation history to get conversational response
                Map<String, Object> modelDecisionTurn = new HashMap<>();
                modelDecisionTurn.put("role", "model");
                modelDecisionTurn.put("parts", List.of(Map.of("text", rawAiDecision)));
                contents.add(modelDecisionTurn);

                Map<String, Object> sqlResultTurn = new HashMap<>();
                sqlResultTurn.put("role", "user");
                sqlResultTurn.put("parts", List.of(Map.of("text", 
                    "System Notification: The requested SQL query executed successfully and returned the following data:\n" +
                    dataJson + "\n\nFormulate your final response to the user based on this database output. Explain the results nicely and match user expectation.")));
                contents.add(sqlResultTurn);

                String finalReply = callGeminiApi(apiKey, contents);

                response.put("type", "stats");
                response.put("title", "AI Query Results");
                response.put("message", finalReply);
                response.put("data", data);
                response.put("sql", sql);
            } else {
                // action is RESPOND
                String reply = decisionMap.get("reply");
                response.put("type", "stats");
                response.put("title", "AI Placement Assistant");
                response.put("message", reply);
            }

        } catch (Exception e) {
            response.put("type", "error");
            response.put("message", "Failed to process AI query: " + e.getMessage() + ". Attempting offline backup parsing.");
            return executeRuleBasedQuery(queryText);
        }

        return response;
    }

    private Map<String, Object> executeRuleBasedQuery(String queryText) {
        Map<String, Object> response = new HashMap<>();
        response.put("query", queryText);
        
        try {
            Map<String, Object> parsed = parseQueryRuleBased(queryText);
            String sql = (String) parsed.get("sql");
            String explanation = (String) parsed.get("explanation");

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            response.put("type", "stats");
            response.put("title", "AI Assistant (Local Parser)");
            
            String customMessage = explanation + "\n\nFound **" + data.size() + "** record(s).";
            if (parsed.containsKey("customMessage")) {
                customMessage = (String) parsed.get("customMessage");
            }

            response.put("message", customMessage);
            response.put("data", data);
            response.put("sql", sql);
        } catch (Exception e) {
            response.put("type", "error");
            response.put("message", "Failed to execute local query fallback: " + e.getMessage());
        }
        return response;
    }

    private Map<String, Object> parseQueryRuleBased(String queryText) {
        String cleaned = queryText.toLowerCase().trim();
        Map<String, Object> res = new HashMap<>();
        
        String sql = "";
        String explanation = "";
        
        boolean isCount = cleaned.contains("how many") || cleaned.contains("count") || cleaned.contains("number of") || cleaned.contains("total") || cleaned.contains("qty") || cleaned.contains("howmuch") || cleaned.contains("how much");

        // 1. Prioritize generic Count checks first (fuzzy matches)
        if (isCount) {
            if (cleaned.contains("apply") || cleaned.contains("applied") || cleaned.contains("application") || cleaned.contains("appli")) {
                List<String> companyNames = jdbcTemplate.queryForList("SELECT name FROM companies", String.class);
                String matchedCompany = null;
                for (String name : companyNames) {
                    if (cleaned.contains(name.toLowerCase())) {
                        matchedCompany = name;
                        break;
                    }
                }
                if (matchedCompany == null) {
                    if (cleaned.contains("tcs")) matchedCompany = "TCS";
                    else if (cleaned.contains("google")) matchedCompany = "Google";
                    else if (cleaned.contains("microsoft")) matchedCompany = "Microsoft";
                    else if (cleaned.contains("capgemini")) matchedCompany = "Capgemini";
                }
                
                String whereClause = "";
                if (matchedCompany != null) {
                    whereClause = " WHERE c.name ILIKE '%" + matchedCompany + "%'";
                }
                
                sql = "SELECT COUNT(*) as \"Total Applications\" " +
                      "FROM job_applications ja JOIN jobs j ON ja.job_id = j.id JOIN companies c ON j.company_id = c.id" + whereClause;
                explanation = "Counting student applications " + (matchedCompany != null ? "for " + matchedCompany : "") + ".";
                
                Number countVal = jdbcTemplate.queryForObject(sql, Number.class);
                res.put("sql", sql);
                res.put("explanation", explanation);
                res.put("customMessage", "Total applications" + (matchedCompany != null ? " for **" + matchedCompany + "**" : "") + ": **" + countVal + "**");
                return res;
            }
            if (cleaned.contains("alum")) {
                sql = "SELECT COUNT(*) as \"Total Alumni\" FROM users WHERE role = 'ALUMNI'";
                explanation = "Counting total enrolled/registered alumni.";
                res.put("sql", sql);
                res.put("explanation", explanation);
                
                Number countVal = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'ALUMNI'", Number.class);
                res.put("customMessage", "Total enrolled alumni: **" + countVal + "**");
                return res;
            }
            if (cleaned.contains("stud")) {
                sql = "SELECT COUNT(*) as \"Total Students\" FROM users WHERE role = 'STUDENT'";
                explanation = "Counting total enrolled/registered students.";
                res.put("sql", sql);
                res.put("explanation", explanation);
                
                Number countVal = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'STUDENT'", Number.class);
                res.put("customMessage", "Total enrolled students: **" + countVal + "**");
                return res;
            }
            if (cleaned.contains("comp") || cleaned.contains("partner")) {
                sql = "SELECT COUNT(*) as \"Total Partner Companies\" FROM companies";
                explanation = "Counting total partner companies.";
                res.put("sql", sql);
                res.put("explanation", explanation);
                
                Number countVal = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM companies", Number.class);
                res.put("customMessage", "Total partner companies: **" + countVal + "**");
                return res;
            }
            if (cleaned.contains("job") || cleaned.contains("post")) {
                sql = "SELECT COUNT(*) as \"Total Job Posts\" FROM jobs";
                explanation = "Counting total job postings.";
                res.put("sql", sql);
                res.put("explanation", explanation);
                
                Number countVal = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM jobs", Number.class);
                res.put("customMessage", "Total job postings: **" + countVal + "**");
                return res;
            }
        }

        // 2. Specific User Profile Lookups
        List<Map<String, Object>> allUsers = jdbcTemplate.queryForList("SELECT id, full_name FROM users");
        Long matchedUserId = null;
        String matchedFullName = null;

        for (Map<String, Object> u : allUsers) {
            String fullName = (String) u.get("full_name");
            if (fullName == null) continue;
            
            String fnLower = fullName.toLowerCase();
            if (fnLower.equals("student") || fnLower.equals("alumni") || fnLower.equals("hr") || fnLower.equals("admin")) {
                continue;
            }
            
            if (cleaned.contains(fnLower)) {
                matchedUserId = ((Number) u.get("id")).longValue();
                matchedFullName = fullName;
                break;
            }
            
            String[] tokens = fnLower.split("\\s+");
            int matches = 0;
            for (String token : tokens) {
                if (token.equals("verify") || token.equals("alumni") || token.equals("student")) {
                    continue;
                }
                if (token.length() > 2 && cleaned.contains(token)) {
                    matches++;
                }
            }
            if (matches > 0 && matches >= tokens.length - 1) {
                matchedUserId = ((Number) u.get("id")).longValue();
                matchedFullName = fullName;
                break;
            }
        }

        if (matchedUserId != null) {
            String role = jdbcTemplate.queryForObject("SELECT role FROM users WHERE id = " + matchedUserId, String.class);
            if ("STUDENT".equals(role)) {
                sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", u.role as \"Role\", " +
                      "sp.roll_number as \"Roll No\", sp.department as \"Department\", sp.cgpa as \"CGPA\", " +
                      "sp.graduation_year as \"Graduation Year\" " +
                      "FROM users u " +
                      "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                      "WHERE u.id = " + matchedUserId;
                
                explanation = "Fetching profile details for student: " + matchedFullName + ".";
                
                List<Map<String, Object>> apps = jdbcTemplate.queryForList(
                    "SELECT c.name as company, j.title as job, ja.status as status " +
                    "FROM job_applications ja " +
                    "JOIN jobs j ON ja.job_id = j.id " +
                    "JOIN companies c ON j.company_id = c.id " +
                    "WHERE ja.student_profile_id = " + matchedUserId
                );

                StringBuilder msgBuilder = new StringBuilder();
                msgBuilder.append("Here is the profile details for student **").append(matchedFullName).append("**:\n\n");
                
                if (apps.isEmpty()) {
                    msgBuilder.append("**Placement Status:** No job applications submitted yet.");
                } else {
                    msgBuilder.append("**Placement Applications Status:**\n");
                    for (Map<String, Object> app : apps) {
                        msgBuilder.append("- ").append(app.get("company"))
                                  .append(" (").append(app.get("job")).append("): ")
                                  .append("**").append(app.get("status")).append("**\n");
                    }
                }
                res.put("sql", sql);
                res.put("explanation", explanation);
                res.put("customMessage", msgBuilder.toString());
            } else if ("ALUMNI".equals(role)) {
                sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", u.role as \"Role\", " +
                      "ap.department as \"Department\", ap.current_company as \"Current Company\", " +
                      "ap.job_role as \"Job Role\", ap.graduation_year as \"Graduation Year\" " +
                      "FROM users u " +
                      "LEFT JOIN alumni_profiles ap ON u.id = ap.user_id " +
                      "WHERE u.id = " + matchedUserId;
                
                explanation = "Fetching profile details for alumni: " + matchedFullName + ".";
                
                StringBuilder msgBuilder = new StringBuilder();
                msgBuilder.append("Here is the profile details for alumni **").append(matchedFullName).append("**:\n\n");
                msgBuilder.append("**Employment Status:** Enrolled as Alumni.\n");
                
                res.put("sql", sql);
                res.put("explanation", explanation);
                res.put("customMessage", msgBuilder.toString());
            } else {
                sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", u.role as \"Role\" " +
                      "FROM users u WHERE u.id = " + matchedUserId;
                explanation = "Fetching profile details for user: " + matchedFullName + ".";
                res.put("sql", sql);
                res.put("explanation", explanation);
            }
            return res;
        }

        // 3. General list queries (fuzzy matches)
        if (cleaned.contains("stud")) {
            sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", sp.roll_number as \"Roll No\", sp.department as \"Department\", sp.cgpa as \"CGPA\" " +
                  "FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'STUDENT'";
            explanation = "Listing all enrolled students.";
            res.put("sql", sql);
            res.put("explanation", explanation);
            return res;
        }
        if (cleaned.contains("alum")) {
            sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", ap.department as \"Department\", ap.current_company as \"Company\", ap.job_role as \"Role\" " +
                  "FROM users u JOIN alumni_profiles ap ON u.id = ap.user_id WHERE u.role = 'ALUMNI'";
            explanation = "Listing all enrolled alumni.";
            res.put("sql", sql);
            res.put("explanation", explanation);
            return res;
        }
        if (cleaned.contains("comp")) {
            sql = "SELECT name as \"Company Name\", industry as \"Industry\", website as \"Website\" FROM companies";
            explanation = "Listing all partner companies.";
            res.put("sql", sql);
            res.put("explanation", explanation);
            return res;
        }
        if (cleaned.contains("job") || cleaned.contains("post")) {
            sql = "SELECT j.title as \"Job Title\", c.name as \"Company\", j.location as \"Location\", j.salary_range as \"Salary\" " +
                  "FROM jobs j JOIN companies c ON j.company_id = c.id";
            explanation = "Listing all posted jobs.";
            res.put("sql", sql);
            res.put("explanation", explanation);
            return res;
        }
        
        // 4. Specific filter/actions fallback checks
        if (cleaned.contains("mentor") || cleaned.contains("profile")) {
            boolean approvedOnly = cleaned.contains("approved") || cleaned.contains("verified");
            sql = "SELECT u.full_name as \"Name\", u.email as \"Email\", ap.current_company as \"Company\", ap.job_role as \"Role\" " +
                  "FROM users u JOIN alumni_profiles ap ON u.id = ap.user_id" + 
                  (approvedOnly ? " WHERE u.is_verified = true" : "");
            explanation = "Listing " + (approvedOnly ? "approved " : "") + "alumni mentors.";
        }
        else if (cleaned.contains("apply") || cleaned.contains("applied") || cleaned.contains("application")) {
            List<String> companyNames = jdbcTemplate.queryForList("SELECT name FROM companies", String.class);
            String matchedCompany = null;
            for (String name : companyNames) {
                if (cleaned.contains(name.toLowerCase())) {
                    matchedCompany = name;
                    break;
                }
            }
            if (matchedCompany == null) {
                if (cleaned.contains("tcs")) matchedCompany = "TCS";
                else if (cleaned.contains("google")) matchedCompany = "Google";
                else if (cleaned.contains("microsoft")) matchedCompany = "Microsoft";
                else if (cleaned.contains("capgemini")) matchedCompany = "Capgemini";
            }
            
            String whereClause = "";
            if (matchedCompany != null) {
                whereClause = " WHERE c.name ILIKE '%" + matchedCompany + "%'";
            }
            
            sql = "SELECT u.full_name as \"Student\", c.name as \"Company\", j.title as \"Job Title\", ja.status as \"Status\" " +
                  "FROM job_applications ja JOIN jobs j ON ja.job_id = j.id JOIN companies c ON j.company_id = c.id " +
                  "JOIN users u ON ja.student_profile_id = u.id" + whereClause;
            explanation = "Listing student applications " + (matchedCompany != null ? "for " + matchedCompany : "") + ".";
        }
        else if (cleaned.contains("plac") || cleaned.contains("selec")) {
            Integer year = null;
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\b(\\d{4})\\b");
            java.util.regex.Matcher m = p.matcher(cleaned);
            if (m.find()) {
                year = Integer.parseInt(m.group(1));
            }
            
            String where = " WHERE ja.status = 'SELECTED'";
            if (year != null) {
                where += " AND sp.graduation_year = " + year;
            }
            
            sql = "SELECT u.full_name as \"Student\", sp.department as \"Department\", c.name as \"Company\", j.salary_range as \"Package\" " +
                  "FROM job_applications ja JOIN student_profiles sp ON ja.student_profile_id = sp.user_id " +
                  "JOIN users u ON sp.user_id = u.id JOIN jobs j ON ja.job_id = j.id JOIN companies c ON j.company_id = c.id" + where;
            explanation = "Listing placed students" + (year != null ? " in " + year : "") + ".";
        }
        else if (cleaned.contains("unplac")) {
            String dept = null;
            if (cleaned.contains("computer")) dept = "Computer Engineering";
            else if (cleaned.contains("information") || cleaned.contains("it")) dept = "Information Technology";
            else if (cleaned.contains("entc")) dept = "ENTC";
            
            String where = " WHERE u.role = 'STUDENT' AND u.id NOT IN (SELECT student_profile_id FROM job_applications WHERE status = 'SELECTED')";
            if (dept != null) {
                where += " AND sp.department ILIKE '%" + dept + "%'";
            }
            
            sql = "SELECT u.full_name as \"Student\", sp.roll_number as \"Roll No\", sp.department as \"Department\", sp.cgpa as \"CGPA\" " +
                  "FROM users u JOIN student_profiles sp ON u.id = sp.user_id" + where;
            explanation = "Listing unplaced students" + (dept != null ? " from " + dept : "") + ".";
        }
        else if (cleaned.contains("company") && (cleaned.contains("hired") || cleaned.contains("most"))) {
            sql = "SELECT c.name as \"Company\", COUNT(*) as \"Total Hires\" " +
                  "FROM job_applications ja JOIN jobs j ON ja.job_id = j.id JOIN companies c ON j.company_id = c.id " +
                  "WHERE ja.status = 'SELECTED' GROUP BY c.name ORDER BY COUNT(*) DESC";
            explanation = "Listing companies sorted by number of selections/hires.";
        }
        else if (cleaned.contains("package") || cleaned.contains("salary")) {
            boolean highest = cleaned.contains("highest") || cleaned.contains("max");
            if (highest) {
                sql = "SELECT u.full_name as \"Student\", c.name as \"Company\", j.salary_range as \"Salary\" " +
                      "FROM job_applications ja JOIN student_profiles sp ON ja.student_profile_id = sp.user_id " +
                      "JOIN users u ON sp.user_id = u.id JOIN jobs j ON ja.job_id = j.id JOIN companies c ON j.company_id = c.id " +
                      "WHERE ja.status = 'SELECTED' AND j.salary_range IS NOT NULL ORDER BY j.salary_range DESC LIMIT 1";
                explanation = "Fetching highest package placement details.";
            } else {
                sql = "SELECT AVG(CAST(REGEXP_REPLACE(salary_range, '[^0-9.]', '', 'g') AS DOUBLE PRECISION)) as \"Average LPA\" " +
                      "FROM jobs WHERE salary_range IS NOT NULL AND salary_range ~ '[0-9]'";
                explanation = "Calculating average salary package from posted jobs.";
            }
        }
        // Default / Fallback
        else {
            sql = "SELECT u.full_name as \"Name\", u.role as \"Role\", u.email as \"Email\", u.is_active as \"Active\" FROM users u LIMIT 20";
            explanation = "General fallback: Listing first 20 users.";
        }
        
        res.put("sql", sql);
        res.put("explanation", explanation);
        return res;
    }

    private String callGeminiApi(String apiKey, List<Map<String, Object>> contents) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (httpResponse.statusCode() != 200) {
            throw new RuntimeException("Gemini API error (Status " + httpResponse.statusCode() + "): " + httpResponse.body());
        }

        Map<String, Object> responseMap = objectMapper.readValue(httpResponse.body(), Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("No response candidate returned from Gemini API.");
        }

        Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
        String text = (String) parts.get(0).get("text");

        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        }
        if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }
}
