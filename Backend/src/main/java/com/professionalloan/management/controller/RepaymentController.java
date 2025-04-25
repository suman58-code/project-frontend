package com.professionalloan.management.controller;

import com.professionalloan.management.model.Repayment;
import com.professionalloan.management.service.RepaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repayments")
@CrossOrigin(origins = "http://localhost:5173")
public class RepaymentController {

    @Autowired
    private RepaymentService repaymentService;

    // Calculate EMI amount before taking loan
    @GetMapping("/calculate-emi")
    public ResponseEntity<BigDecimal> calculateEMI(
            @RequestParam BigDecimal principal,
            @RequestParam int tenure,
            @RequestParam(defaultValue = "12.0") double interestRate) {
        BigDecimal emi = repaymentService.calculateEMI(principal, tenure, interestRate);
        return ResponseEntity.ok(emi);
    }

    // Generate EMI schedule after loan disbursement
    @PostMapping("/generate-schedule/{applicationId}")
    public ResponseEntity<List<Repayment>> generateEMISchedule(
            @PathVariable String applicationId,
            @RequestParam int tenure) {
        List<Repayment> schedule = repaymentService.generateEMISchedule(applicationId, tenure);
        return ResponseEntity.ok(schedule);
    }

    // Make EMI payment
    @PostMapping("/pay/{repaymentId}")
    public ResponseEntity<?> makePayment(@PathVariable Long repaymentId) {
        try {
            Repayment payment = repaymentService.makePayment(repaymentId);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all EMIs for a loan
    @GetMapping("/loan/{applicationId}")
    public ResponseEntity<List<Repayment>> getLoanEMIs(@PathVariable String applicationId) {
        List<Repayment> emis = repaymentService.getLoanEMIs(applicationId);
        return ResponseEntity.ok(emis);
    }

    // Get pending EMIs for a loan
    @GetMapping("/pending/{applicationId}")
    public ResponseEntity<List<Repayment>> getPendingEMIs(@PathVariable String applicationId) {
        List<Repayment> pendingEmis = repaymentService.getPendingEMIs(applicationId);
        return ResponseEntity.ok(pendingEmis);
    }
} 