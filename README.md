# CareerNexus

CareerNexus is a placement and career networking platform developed using Spring Boot. The platform connects Students, Alumni, and HR professionals, helping users discover job opportunities, share interview experiences, manage resumes, and build professional connections.

## Features

* User Authentication & Authorization (JWT Based)
* Student, Alumni, HR, and Admin Roles
* Company Management
* Job Posting & Job Search
* Save Jobs
* Resume Management
* Interview Experience Sharing
* Mentorship Support
* Event Management
* Notifications
* Real-Time Chat
* Audit Logging

## Technology Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Maven

### Database

* PostgreSQL

### Tools

* Eclipse IDE
* Git & GitHub
* Postman

## Project Structure

src/main/java/com/careernexus

* config
* controller
* dto
* entity
* exception
* repository
* security
* service

## Getting Started

### Clone Repository

```bash
git clone https://github.com/MALIJANHAVIANIL/CareerNexus.git
```

### Configure Database

Update database credentials in:

```properties
src/main/resources/application.properties
```

### Run Application

```bash
mvn spring-boot:run
```

Application will start on:

```text
http://localhost:8081
```

## API Testing

All APIs can be tested using Postman.

## Future Enhancements

* React Frontend
* Advanced Job Recommendations
* Resume Analysis
* Real-Time Messaging Improvements
* Placement Analytics Dashboard

## Author

Janhavi Anil Mali
