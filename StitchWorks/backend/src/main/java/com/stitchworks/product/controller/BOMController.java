package com.stitchworks.product.controller;

import com.stitchworks.product.dto.BOMDto;
import com.stitchworks.product.service.BOMService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bom")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'PRODUCTION_STAFF', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class BOMController {

    private final BOMService service;

    @GetMapping("/{productId}")
    public List<BOMDto> getBomsByProductId(@PathVariable Long productId) {
        return service.getBomsByProductId(productId);
    }

    @PostMapping("/{productId}")
    public BOMDto addBOM(@PathVariable Long productId, @RequestBody BOMDto dto) {
        return service.addBOM(productId, dto);
    }

    @DeleteMapping("/{bomId}")
    public void removeBOM(@PathVariable Long bomId) {
        service.removeBOM(bomId);
    }
}
