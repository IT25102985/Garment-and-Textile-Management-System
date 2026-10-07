package com.stitchworks.config;

import com.stitchworks.purchasing.model.MaterialCategory;
import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.MaterialCategoryRepository;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.admin.model.SystemProperty;
import com.stitchworks.admin.repository.SystemPropertyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@Order(3) // Run after initial data seeding if any
@RequiredArgsConstructor
public class MaterialCategoryMigration implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(MaterialCategoryMigration.class);

    private final RawMaterialRepository rawMaterialRepository;
    private final MaterialCategoryRepository materialCategoryRepository;
    private final SystemPropertyRepository systemPropertyRepository;

    @Override
    public void run(String... args) throws Exception {
        Optional<SystemProperty> migrationStatus = systemPropertyRepository.findById("MIGRATION_MATERIAL_CATEGORIES");
        if (migrationStatus.isPresent() && "DONE".equals(migrationStatus.get().getValue())) {
            logger.info("MaterialCategory data migration already completed. Skipping.");
            return;
        }

        logger.info("Running MaterialCategory data migration...");

        List<RawMaterial> materialsToMigrate = rawMaterialRepository.findAll().stream()
                .filter(m -> m.getMaterialCategory() == null && m.getCategory() != null && !m.getCategory().isEmpty())
                .toList();

        if (materialsToMigrate.isEmpty()) {
            logger.info("No raw materials require migration to material category.");
            return;
        }

        logger.info("Found {} raw materials to migrate.", materialsToMigrate.size());

        for (RawMaterial material : materialsToMigrate) {
            String categoryName = material.getCategory();
            
            Optional<MaterialCategory> categoryOpt = materialCategoryRepository.findByName(categoryName);
            MaterialCategory category;
            
            if (categoryOpt.isPresent()) {
                category = categoryOpt.get();
            } else {
                category = MaterialCategory.builder()
                        .name(categoryName)
                        .description("Auto-migrated category for " + categoryName)
                        .build();
                category = materialCategoryRepository.save(category);
                logger.info("Created new MaterialCategory: {}", categoryName);
            }
            
            material.setMaterialCategory(category);
            rawMaterialRepository.save(material);
        }

        systemPropertyRepository.save(SystemProperty.builder()
                .key("MIGRATION_MATERIAL_CATEGORIES")
                .value("DONE")
                .build());

        logger.info("MaterialCategory data migration completed.");
    }
}
