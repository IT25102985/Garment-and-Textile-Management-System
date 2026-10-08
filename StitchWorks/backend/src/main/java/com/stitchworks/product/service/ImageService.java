package com.stitchworks.product.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class ImageService {

    private final String PEXELS_API_KEY = "yfd8PwM2HiVm3iLrfYEp8WBUGAGtHj71Gmdz8deZXo9c0dmuZf7Zr2rJ";
    private final RestTemplate restTemplate = new RestTemplate();

    public String fetchGarmentImage(String productName) {
        try {
            String encodedQuery = URLEncoder.encode(productName + " fashion high end", StandardCharsets.UTF_8);
            String url = "https://api.pexels.com/v1/search?query=" + encodedQuery + "&per_page=5&orientation=portrait";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", PEXELS_API_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("photos")) {
                List<Map<String, Object>> photos = (List<Map<String, Object>>) body.get("photos");
                if (!photos.isEmpty()) {
                    List<String> keywords = List.of("garment", "clothing", "apparel", "fashion", "wear", "dress", "shirt", "jacket", "jeans", "textile", "fabric", "outfit", "style");
                    
                    for (Map<String, Object> photo : photos) {
                        String altText = (String) photo.getOrDefault("alt", "");
                        String photographer = (String) photo.getOrDefault("photographer", "");
                        
                        boolean matchFound = keywords.stream().anyMatch(kw -> 
                            altText.toLowerCase().contains(kw) || photographer.toLowerCase().contains(kw)
                        );
                        
                        if (matchFound) {
                            Map<String, String> src = (Map<String, String>) photo.get("src");
                            return src.get("large2x");
                        }
                    }
                    
                    // Fallback to first photo
                    Map<String, String> src = (Map<String, String>) photos.get(0).get("src");
                    return src.get("large2x");
                }
            }
        } catch (Exception e) {
            // Log error
            System.err.println("Failed to fetch image from Pexels: " + e.getMessage());
        }
        
        return "https://via.placeholder.com/400x400?text=StitchWorks+Garment";
    }

    public String fetchMaterialImage(String materialName) {
        try {
            String encodedQuery = URLEncoder.encode(materialName + " texture macro", StandardCharsets.UTF_8);
            String url = "https://api.pexels.com/v1/search?query=" + encodedQuery + "&per_page=5";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", PEXELS_API_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("photos")) {
                List<Map<String, Object>> photos = (List<Map<String, Object>>) body.get("photos");
                if (!photos.isEmpty()) {
                    List<String> keywords = List.of("textile", "fabric", "cloth", "material", "swatch", "cotton", "denim", "silk", "linen", "wool");
                    
                    for (Map<String, Object> photo : photos) {
                        String altText = (String) photo.getOrDefault("alt", "");
                        
                        boolean matchFound = keywords.stream().anyMatch(kw -> 
                            altText.toLowerCase().contains(kw)
                        );
                        
                        if (matchFound) {
                            Map<String, String> src = (Map<String, String>) photo.get("src");
                            return src.get("large2x");
                        }
                    }
                    
                    // Fallback to first photo
                    Map<String, String> src = (Map<String, String>) photos.get(0).get("src");
                    return src.get("large2x");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch image from Pexels: " + e.getMessage());
        }
        
        return "https://via.placeholder.com/400x400?text=StitchWorks+Material";
    }
}
