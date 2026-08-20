package com.example.jobtracker.service;

import com.example.jobtracker.model.JobApplication;
import com.example.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository){
        this.repository = repository;
    }

    public JobApplication createApplication(JobApplication application){
        return repository.save(application);
    }

    public List<JobApplication> getAllApplications() {
        return repository.findAll();
    }

    public JobApplication getApplicationById(Long id){
        return repository.findById(id).orElseThrow();
    }

    public void deleteApplication(Long id){
        repository.deleteById(id);
    }

    public JobApplication updateApplication(Long id,JobApplication updatedApplication) {

    JobApplication existingApplication = repository.findById(id).orElseThrow();

    existingApplication.setCompany(updatedApplication.getCompany());

    existingApplication.setJobTitle(updatedApplication.getJobTitle());

    existingApplication.setLocation(updatedApplication.getLocation());

    existingApplication.setJobUrl(updatedApplication.getJobUrl());

    existingApplication.setStatus(updatedApplication.getStatus());

    existingApplication.setDateApplied(updatedApplication.getDateApplied());

    existingApplication.setNotes(updatedApplication.getNotes());

    return repository.save(existingApplication);
}
}
