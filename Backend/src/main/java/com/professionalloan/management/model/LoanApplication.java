package com.professionalloan.management.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_applications")
public class LoanApplication {

    @Id
    @Column(name = "application_id", nullable = false, updatable = false)
    private String applicationId; 

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String profession;

    @Column(nullable = false)
    private String purpose;

    @Column(name = "loan_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "credit_score", nullable = false)
    private Integer creditScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Lob
    @Column(name = "pf_account_pdf")
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    private byte[] pfAccountPdf;

    @Lob
    @Column(name = "salary_slip")
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    private byte[] salarySlip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public BigDecimal getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(BigDecimal loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Integer getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public byte[] getPfAccountPdf() {
        return pfAccountPdf;
    }

    public void setPfAccountPdf(byte[] pfAccountPdf) {
        this.pfAccountPdf = pfAccountPdf;
    }

    public byte[] getSalarySlip() {
        return salarySlip;
    }

    public void setSalarySlip(byte[] salarySlip) {
        this.salarySlip = salarySlip;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
