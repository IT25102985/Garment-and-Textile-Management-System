package com.stitchworks.product.controller;

import com.stitchworks.product.dto.SizeDto;
import com.stitchworks.product.service.SizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'PRODUCTION_STAFF', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class SizeController {

    private final SizeService service;

    @GetMapping
    public List<SizeDto> getAllSizes() {
        return service.getAllSizes();
    }

    @GetMapping("/{id}")
    public SizeDto getSizeById(@PathVariable Long id) {
        return service.getSizeById(id);
    }

    @PostMapping
    public SizeDto createSize(@RequestBody SizeDto dto) {
        return service.createSize(dto);
    }

    @PostMapping("/upload")
    public ResponseEntity<SizeDto> createSizeWithMeasurements(
            @RequestPart("size") SizeDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        SizeDto createdSize = service.createSizeWithMeasurements(dto, file);
        return ResponseEntity.ok(createdSize);
    }

    @PutMapping("/{id}")
    public SizeDto updateSize(@PathVariable Long id, @RequestBody SizeDto dto) {
        return service.updateSize(id, dto);
    }

    @PutMapping("/{id}/upload")
    public ResponseEntity<SizeDto> updateSizeWithMeasurements(
            @PathVariable Long id,
            @RequestPart("size") SizeDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        SizeDto updatedSize = service.updateSizeWithMeasurements(id, dto, file);
        return ResponseEntity.ok(updatedSize);
    }

    @DeleteMapping("/{id}")
    public void deleteSize(@PathVariable Long id) {
        service.deleteSize(id);
    }
}
