package com.stitchworks.purchasing.service;

import com.stitchworks.purchasing.dto.SupplierDto;
import com.stitchworks.purchasing.model.Supplier;
import com.stitchworks.purchasing.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .paymentTerms(dto.getPaymentTerms())
                .performanceRating(dto.getPerformanceRating())
                .build();
        return mapToDto(supplierRepository.save(supplier));
    }

    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setPerformanceRating(dto.getPerformanceRating());
        return mapToDto(supplierRepository.save(supplier));
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    public SupplierDto mapToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setPaymentTerms(supplier.getPaymentTerms());
        dto.setPerformanceRating(supplier.getPerformanceRating());
        return dto;
    }
}
