package com.example.jobtracker.model;


import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    private String company;

    private String jobTitle;

    private String location;

    private String jobUrl;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private LocalDate dateApplied;

    private String notes;

    public JobApplication(
        String company,
        String jobTitle,
        String location,
        String jobUrl,
        ApplicationStatus status,
        LocalDate dateApplied,
        String notes
    ) {
        this.company = company;
        this.jobTitle = jobTitle;
        this.location = location;
        this.jobUrl = jobUrl;
        this.status = status;
        this.dateApplied = dateApplied;
        this.notes = notes;
    }

    public Long getId(){
        return Id;
    }
    public String getCompany(){
        return company;
    }
    public void setCompany(String company){
        this.company = company;
    }

    public String getJobTitle(){
        return jobTitle;
    }

    public void setJobTitle(String jobTitle){
        this.jobTitle = jobTitle;
    }

    public String getLocation(){
        return location;
    }

    public void setLocation(String location){
        this.location = location;
    }

    public String getJobUrl() {
    return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDate getDateApplied() {
        return dateApplied;
    }

    public void setDateApplied(LocalDate dateApplied) {
        this.dateApplied = dateApplied;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

}