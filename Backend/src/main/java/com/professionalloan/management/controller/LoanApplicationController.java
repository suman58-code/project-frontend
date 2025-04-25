package com.professionalloan.management.controller;

import com.professionalloan.management.model.LoanApplication;
import com.professionalloan.management.model.ApplicationStatus;
import com.professionalloan.management.service.LoanApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanApplicationController {
    @Autowired
    private LoanApplicationService loanService;

    @PostMapping(value = "/apply", consumes = "multipart/form-data")
    public ResponseEntity<?> submitApplication(
            @RequestParam("name") String name,
            @RequestParam("profession") String profession,
            @RequestParam("purpose") String purpose,
            @RequestParam("loanAmount") BigDecimal loanAmount,
            @RequestParam("creditScore") Integer creditScore,
            @RequestParam("userId") Long userId,
            @RequestParam("pfAccountPdf") MultipartFile pfAccountPdf,
            @RequestParam("salarySlip") MultipartFile salarySlip
    ) {
        try {
            if (pfAccountPdf.getSize() > 5 * 1024 * 1024 || salarySlip.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("PDF files must be under 5MB");
            }
            LoanApplication savedApplication = loanService.submitApplicationWithFiles(
                    name, profession, purpose, loanAmount, creditScore,
                    userId, pfAccountPdf, salarySlip
            );
            return ResponseEntity.ok(savedApplication);
        } catch (Exception e) {
            System.err.println("Error submitting application: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to submit application: " + e.getMessage());
        }
    }

    @PutMapping("/update-status/{applicationId}")
    public ResponseEntity<?> updateLoanStatus(
            @PathVariable String applicationId,
            @RequestParam String status) {
        try {
            LoanApplication updated = loanService.updateLoanStatus(applicationId, ApplicationStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Error updating status for application " + applicationId + ": " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<LoanApplication>> getAllApplications() {
        try {
            List<LoanApplication> allApplications = loanService.getAllApplications();
            return ResponseEntity.ok(allApplications);
        } catch (Exception e) {
            System.err.println("Error fetching all applications: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoanApplication>> getUserApplications(@PathVariable Long userId) {
        try {
            List<LoanApplication> userApplications = loanService.getApplicationsByUserId(userId);
            return ResponseEntity.ok(userApplications);
        } catch (Exception e) {
            System.err.println("Error fetching applications for user " + userId + ": " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}