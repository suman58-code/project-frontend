package com.professionalloan.management.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.professionalloan.management.model.Disbursement;
import com.professionalloan.management.service.DisbursementService;

@RestController
@RequestMapping("/api/disbursements")
@CrossOrigin(origins = "http://localhost:5173")
public class DisbursementController {
	 @Autowired
	    private DisbursementService disbursementService;

	    @PostMapping("/disburse/{applicationId}")
	    public ResponseEntity<Disbursement> disburseLoan(
	            @PathVariable String applicationId,
	            @RequestParam BigDecimal amount) {
	        Disbursement disbursement = disbursementService.disburseLoan(applicationId, amount);
	        return ResponseEntity.ok(disbursement);
	    }
}
