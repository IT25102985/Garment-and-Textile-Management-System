package com.stitchworks.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = new File("uploads").getAbsolutePath();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");

        // Resolve absolute paths for live static resources (both development and production)
        List<String> locations = new ArrayList<>();
        
        File devStaticDir = new File("backend/src/main/resources/static");
        if (!devStaticDir.exists()) {
            devStaticDir = new File("src/main/resources/static");
        }
        if (devStaticDir.exists()) {
            locations.add("file:" + devStaticDir.getAbsolutePath() + "/");
        }

        File targetStaticDir = new File("backend/target/classes/static");
        if (!targetStaticDir.exists()) {
            targetStaticDir = new File("target/classes/static");
        }
        if (targetStaticDir.exists()) {
            locations.add("file:" + targetStaticDir.getAbsolutePath() + "/");
        }

        locations.add("classpath:/static/");

        // Forward non-API and non-static requests to index.html for React Router SPA fallback with zero caching
        registry.addResourceHandler("/**")
                .addResourceLocations(locations.toArray(new String[0]))
                .setCachePeriod(0)
                .resourceChain(false)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // Let DispatcherServlet handle API requests
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        
                        // Check for live index.html in current resource location
                        Resource indexResource = location.createRelative("index.html");
                        if (indexResource.exists() && indexResource.isReadable()) {
                            return indexResource;
                        }

                        // Fallback to classpath
                        Resource fallback = new ClassPathResource("/static/index.html");
                        if (fallback.exists()) {
                            return fallback;
                        }
                        return null;
                    }
                });
    }
}
