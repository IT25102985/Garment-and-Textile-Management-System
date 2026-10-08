package com.stitchworks.product.controller;

import com.stitchworks.product.dto.SizeDto;
import com.stitchworks.product.service.SizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/sizes")
@RequiredArgsConstructor
public class PublicSizeController {

    private final SizeService sizeService;

    @GetMapping
    public List<SizeDto> getAllPublicSizes() {
        return sizeService.getAllSizes();
    }

    @GetMapping("/{id}")
    public SizeDto getPublicSizeById(@PathVariable Long id) {
        return sizeService.getSizeById(id);
    }
}
