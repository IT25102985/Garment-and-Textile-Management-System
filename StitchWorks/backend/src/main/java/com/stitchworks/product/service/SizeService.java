package com.stitchworks.product.service;

import com.stitchworks.product.dto.SizeDto;
import com.stitchworks.product.dto.SizeMeasurementDto;
import com.stitchworks.product.model.Size;
import com.stitchworks.product.model.SizeMeasurement;
import com.stitchworks.product.repository.SizeRepository;
import com.stitchworks.product.repository.SizeMeasurementRepository;
import com.stitchworks.shared.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SizeService {

    private final SizeRepository repository;
    private final SizeMeasurementRepository measurementRepository;
    private final FileStorageService fileStorageService;

    public List<SizeDto> getAllSizes() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SizeDto getSizeById(Long id) {
        return repository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
    }

    @Transactional
    public SizeDto createSizeWithMeasurements(SizeDto dto, MultipartFile file) {
        Size entity = Size.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .build();

        if (file != null && !file.isEmpty()) {
            String filePath = fileStorageService.storeFile(file, "sizes");
            entity.setPatternBlockFilePath(filePath);
        }

        Size savedSize = repository.save(entity);

        if (dto.getMeasurements() != null && !dto.getMeasurements().isEmpty()) {
            List<SizeMeasurement> measurements = dto.getMeasurements().stream()
                    .map(m -> SizeMeasurement.builder()
                            .topicName(m.getTopicName())
                            .measurementValue(m.getMeasurementValue())
                            .size(savedSize)
                            .build())
                    .collect(Collectors.toList());
            measurementRepository.saveAll(measurements);
            savedSize.setMeasurements(measurements);
        }

        return mapToDto(savedSize);
    }

    public SizeDto createSize(SizeDto dto) {
        Size entity = Size.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .build();
        return mapToDto(repository.save(entity));
    }

    @Transactional
    public SizeDto updateSizeWithMeasurements(Long id, SizeDto dto, MultipartFile file) {
        Size entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));

        entity.setName(dto.getName());
        entity.setCode(dto.getCode());

        if (file != null && !file.isEmpty()) {
            if (entity.getPatternBlockFilePath() != null) {
                fileStorageService.deleteFile(entity.getPatternBlockFilePath());
            }
            String filePath = fileStorageService.storeFile(file, "sizes");
            entity.setPatternBlockFilePath(filePath);
        }

        Size savedSize = repository.save(entity);

        if (dto.getMeasurements() != null) {
            measurementRepository.deleteBySizeId(id);
            List<SizeMeasurement> measurements = dto.getMeasurements().stream()
                    .map(m -> SizeMeasurement.builder()
                            .topicName(m.getTopicName())
                            .measurementValue(m.getMeasurementValue())
                            .size(savedSize)
                            .build())
                    .collect(Collectors.toList());
            measurementRepository.saveAll(measurements);
            savedSize.setMeasurements(measurements);
        }

        return mapToDto(savedSize);
    }

    public SizeDto updateSize(Long id, SizeDto dto) {
        Size entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        return mapToDto(repository.save(entity));
    }

    public void deleteSize(Long id) {
        Size size = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
        
        if (size.getPatternBlockFilePath() != null) {
            fileStorageService.deleteFile(size.getPatternBlockFilePath());
        }
        
        measurementRepository.deleteBySizeId(id);
        repository.deleteById(id);
    }

    private SizeDto mapToDto(Size entity) {
        SizeDto dto = new SizeDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCode(entity.getCode());
        dto.setPatternBlockFilePath(entity.getPatternBlockFilePath());
        
        if (entity.getMeasurements() != null) {
            dto.setMeasurements(entity.getMeasurements().stream()
                    .map(m -> {
                        SizeMeasurementDto measurementDto = new SizeMeasurementDto();
                        measurementDto.setId(m.getId());
                        measurementDto.setTopicName(m.getTopicName());
                        measurementDto.setMeasurementValue(m.getMeasurementValue());
                        return measurementDto;
                    })
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
