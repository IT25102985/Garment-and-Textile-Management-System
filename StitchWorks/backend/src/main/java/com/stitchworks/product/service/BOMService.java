package com.stitchworks.product.service;

import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.product.dto.BOMDto;
import com.stitchworks.product.model.BOM;
import com.stitchworks.product.model.FinishedProduct;
import com.stitchworks.product.repository.BOMRepository;
import com.stitchworks.product.repository.FinishedProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BOMService {

    private final BOMRepository bomRepository;
    private final FinishedProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public List<BOMDto> getBomsByProductId(Long productId) {
        return bomRepository.findByProductId(productId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public BOMDto addBOM(Long productId, BOMDto dto) {
        FinishedProduct product = productRepository.findById(productId).orElseThrow();
        RawMaterial material = rawMaterialRepository.findById(dto.getRawMaterialId()).orElseThrow();
        
        BOM bom = BOM.builder()
                .product(product)
                .material(material)
                .quantityRequired(dto.getQuantityRequired())
                .build();
        
        return mapToDto(bomRepository.save(bom));
    }

    @Transactional
    public void removeBOM(Long bomId) {
        bomRepository.deleteById(bomId);
    }

    private BOMDto mapToDto(BOM bom) {
        BOMDto dto = new BOMDto();
        dto.setId(bom.getId());
        dto.setProductId(bom.getProduct().getId());
        dto.setProductName(bom.getProduct().getName());
        dto.setRawMaterialId(bom.getMaterial().getId());
        dto.setRawMaterialName(bom.getMaterial().getName());
        dto.setRawMaterialUnit(bom.getMaterial().getUnit());
        dto.setQuantityRequired(bom.getQuantityRequired());
        dto.setUnit(bom.getMaterial().getUnit());
        return dto;
    }
}
