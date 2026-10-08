package com.stitchworks.product.service;

import com.stitchworks.product.dto.ColorDto;
import com.stitchworks.product.model.Color;
import com.stitchworks.product.repository.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColorService {

    private final ColorRepository repository;

    public List<ColorDto> getAllColors() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ColorDto createColor(ColorDto dto) {
        Color entity = Color.builder()
                .name(dto.getName())
                .hexCode(dto.getHexCode())
                .build();
        return mapToDto(repository.save(entity));
    }

    public ColorDto updateColor(Long id, ColorDto dto) {
        Color entity = repository.findById(id).orElseThrow();
        entity.setName(dto.getName());
        if (dto.getHexCode() != null) {
            entity.setHexCode(dto.getHexCode());
        }
        return mapToDto(repository.save(entity));
    }

    public void deleteColor(Long id) {
        repository.deleteById(id);
    }

    private ColorDto mapToDto(Color entity) {
        ColorDto dto = new ColorDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setHexCode(entity.getHexCode());
        return dto;
    }
}
