package com.stitchworks.inventory.service;

import com.stitchworks.inventory.dto.StorageLocationDto;
import com.stitchworks.inventory.model.StorageLocation;
import com.stitchworks.inventory.repository.StorageLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StorageLocationService {

    private final StorageLocationRepository repository;

    public List<StorageLocationDto> getAllLocations() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public StorageLocationDto getLocationById(Long id) {
        StorageLocation location = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Storage location not found: " + id));
        return mapToDto(location);
    }

    @Transactional
    public StorageLocationDto createLocation(StorageLocationDto dto) {
        if (repository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Storage location code already exists: " + dto.getCode());
        }

        StorageLocation location = StorageLocation.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToDto(repository.save(location));
    }

    @Transactional
    public StorageLocationDto updateLocation(Long id, StorageLocationDto dto) {
        StorageLocation location = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Storage location not found: " + id));

        // Check if code is being changed and if it already exists
        if (!location.getCode().equals(dto.getCode()) && repository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Storage location code already exists: " + dto.getCode());
        }

        location.setCode(dto.getCode());
        location.setName(dto.getName());
        location.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            location.setStatus(dto.getStatus());
        }
        location.setUpdatedAt(LocalDateTime.now());

        return mapToDto(repository.save(location));
    }

    @Transactional
    public void deleteLocation(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Storage location not found: " + id);
        }
        repository.deleteById(id);
    }

    private StorageLocationDto mapToDto(StorageLocation location) {
        StorageLocationDto dto = new StorageLocationDto();
        dto.setId(location.getId());
        dto.setCode(location.getCode());
        dto.setName(location.getName());
        dto.setDescription(location.getDescription());
        dto.setStatus(location.getStatus());
        dto.setCreatedAt(location.getCreatedAt());
        dto.setUpdatedAt(location.getUpdatedAt());
        return dto;
    }
}
