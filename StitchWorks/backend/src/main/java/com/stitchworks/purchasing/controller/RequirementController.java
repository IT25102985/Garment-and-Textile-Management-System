package com.stitchworks.purchasing.controller;

import com.stitchworks.purchasing.model.MaterialRequirement;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.model.Supplier;
import com.stitchworks.purchasing.model.SupplyOffer;
import com.stitchworks.purchasing.repository.MaterialRequirementRepository;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.purchasing.repository.SupplierRepository;
import com.stitchworks.purchasing.repository.SupplyOfferRepository;
import com.stitchworks.hr.model.User;
import com.stitchworks.hr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RequirementController {

    private final MaterialRequirementRepository requirementRepository;
    private final SupplyOfferRepository offerRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    @PostMapping("/api/admin/requirements")
    @PreAuthorize("hasAnyRole('STOREKEEPER', 'ADMIN', 'PURCHASING_OFFICER')")
    public ResponseEntity<?> createRequirement(@RequestBody Map<String, Object> payload) {
        Long rawMaterialId = Long.valueOf(payload.get("rawMaterialId").toString());
        Double quantityNeeded = Double.valueOf(payload.get("quantityNeeded").toString());
        LocalDate deadline = LocalDate.parse(payload.get("deadline").toString());

        RawMaterial rawMaterial = rawMaterialRepository.findById(rawMaterialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        MaterialRequirement requirement = MaterialRequirement.builder()
                .rawMaterial(rawMaterial)
                .quantityNeeded(quantityNeeded)
                .deadline(deadline)
                .status("OPEN")
                .build();

        requirementRepository.save(requirement);
        return ResponseEntity.ok(Map.of("message", "Requirement created successfully"));
    }

    @GetMapping("/api/supplier/requirements")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<?> getSupplierRequirements() {
        return ResponseEntity.ok(requirementRepository.findAll().stream()
                .filter(req -> "OPEN".equals(req.getStatus())));
    }

    @PostMapping("/api/supplier/requirements/{id}/offer")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<?> submitOffer(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Supplier supplier = supplierRepository.findAll().stream()
                .filter(s -> s.getUserId() != null && s.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Supplier profile not found"));

        MaterialRequirement requirement = requirementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        Double price = Double.valueOf(payload.get("price").toString());
        Integer deliveryDays = Integer.valueOf(payload.get("deliveryDays").toString());
        String notes = (String) payload.get("notes");

        SupplyOffer offer = SupplyOffer.builder()
                .supplier(supplier)
                .requirement(requirement)
                .price(price)
                .deliveryDays(deliveryDays)
                .notes(notes)
                .status("PENDING")
                .build();

        offerRepository.save(offer);
        return ResponseEntity.ok(Map.of("message", "Offer submitted successfully"));
    }
}
