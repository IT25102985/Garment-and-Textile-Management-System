package com.stitchworks.product.controller;

import com.stitchworks.product.dto.ColorDto;
import com.stitchworks.product.service.ColorService;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/colors")
@PreAuthorize("hasAnyRole('ADMIN', 'STOREKEEPER', 'PURCHASING_OFFICER', 'PRODUCTION_STAFF', 'SALES_OFFICER')")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService service;

    @GetMapping
    public List<ColorDto> getAllColors() {
        return service.getAllColors();
    }

    @PostMapping
    public ColorDto createColor(@RequestBody ColorDto dto) {
        return service.createColor(dto);
    }

    @PutMapping("/{id}")
    public ColorDto updateColor(@PathVariable Long id, @RequestBody ColorDto dto) {
        return service.updateColor(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteColor(@PathVariable Long id) {
        service.deleteColor(id);
    }
}
