package com.stitchworks.shared;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path targetLocation = this.rootLocation.resolve(subDirectory);
            Files.createDirectories(targetLocation);

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = targetLocation.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/" + subDirectory + "/" + filename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    public void deleteFile(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
            try {
                Path filePath = Paths.get(imageUrl.substring(1));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // log error but continue
                System.err.println("Could not delete file: " + e.getMessage());
            }
        }
    }
}
