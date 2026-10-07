package com.stitchworks.inventory.controller;

import com.stitchworks.inventory.dto.StorageLocationDto;
import com.stitchworks.inventory.service.StorageLocationService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/locations")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER')")
@RequiredArgsConstructor
public class StorageLocationController {

    private final StorageLocationService service;

    @GetMapping
    public List<StorageLocationDto> getAllLocations() {
        return service.getAllLocations();
    }

    @GetMapping("/{id}")
    public StorageLocationDto getLocationById(@PathVariable Long id) {
        return service.getLocationById(id);
    }

    @PostMapping
    public StorageLocationDto createLocation(@RequestBody StorageLocationDto dto) {
        return service.createLocation(dto);
    }

    @PutMapping("/{id}")
    public StorageLocationDto updateLocation(@PathVariable Long id, @RequestBody StorageLocationDto dto) {
        return service.updateLocation(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id) {
        service.deleteLocation(id);
        return ResponseEntity.ok().build();
    }
}
