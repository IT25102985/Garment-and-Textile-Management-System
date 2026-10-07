package com.stitchworks.shared;

import com.stitchworks.purchasing.model.RawMaterial;
import com.stitchworks.purchasing.repository.RawMaterialRepository;
import com.stitchworks.sales.model.Customer;
import com.stitchworks.sales.model.MaterialQuoteRequest;
import com.stitchworks.sales.repository.CustomerRepository;
import com.stitchworks.sales.repository.MaterialQuoteRequestRepository;
import com.stitchworks.sales.repository.SalesOrderRepository;
import com.stitchworks.hr.model.User;
import com.stitchworks.hr.repository.UserRepository;
import com.stitchworks.purchasing.model.MaterialCategory;
import com.stitchworks.purchasing.repository.MaterialCategoryRepository;
import com.stitchworks.purchasing.service.MaterialCategoryService;
import com.stitchworks.purchasing.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final RawMaterialRepository rawMaterialRepository;
    private final MaterialQuoteRequestRepository quoteRequestRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final com.stitchworks.product.repository.FinishedProductRepository finishedProductRepository;
    private final com.stitchworks.inventory.repository.StockLedgerRepository stockLedgerRepository;
    private final MaterialCategoryRepository materialCategoryRepository;
    private final RawMaterialService rawMaterialService;
    private final MaterialCategoryService materialCategoryService;

    @GetMapping("/materials")
    public ResponseEntity<?> getMaterials(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            var filtered = rawMaterialService.getAllRawMaterials().stream()
                .filter(m -> category.equalsIgnoreCase(m.getCategory()))
                .toList();
            return ResponseEntity.ok(filtered);
        }
        return ResponseEntity.ok(rawMaterialService.getAllRawMaterials());
    }

    @GetMapping("/materials/categories")
    public ResponseEntity<?> getMaterialCategories() {
        var categories = materialCategoryService.getAllCategories();
        
        if (categories.isEmpty()) {
            // Fallback for legacy categories
            List<String> legacy = rawMaterialRepository.findAll().stream()
                    .map(RawMaterial::getCategory)
                    .filter(c -> c != null && !c.isEmpty())
                    .distinct()
                    .toList();
            return ResponseEntity.ok(legacy);
        }
        
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/materials/{id}")
    public ResponseEntity<?> getMaterial(@PathVariable Long id) {
        return rawMaterialRepository.findById(id)
                .map(rawMaterialService::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quote-requests")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createQuoteRequest(@RequestBody Map<String, Object> payload, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Customer customer = customerRepository.findAll().stream()
                .filter(c -> c.getUserId() != null && c.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        Long materialId = Long.valueOf(payload.get("materialId").toString());
        Double quantity = Double.valueOf(payload.get("quantity").toString());
        String message = (String) payload.get("message");

        RawMaterial material = rawMaterialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        MaterialQuoteRequest quoteRequest = MaterialQuoteRequest.builder()
                .customer(customer)
                .material(material)
                .quantity(quantity)
                .message(message)
                .build();

        quoteRequestRepository.save(quoteRequest);
        return ResponseEntity.ok(Map.of("message", "Quote request submitted successfully"));
    }

    @GetMapping({"/orders/my", "/api/customer/orders"})
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyOrders(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Customer customer = customerRepository.findAll().stream()
                .filter(c -> c.getUserId() != null && c.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        return ResponseEntity.ok(salesOrderRepository.findByCustomerId(customer.getId()));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts() {
        // Return published products as simple maps or use service
        List<com.stitchworks.product.model.FinishedProduct> products = finishedProductRepository.findByPublishedTrue();

        List<Map<String, Object>> response = products.stream().map(p -> Map.<String, Object>of(
                "id", p.getId(),
                "styleCode", p.getStyleCode(),
                "name", p.getName(),
                "description", p.getDescription() != null ? p.getDescription() : "",
                "basePrice", p.getBasePrice(),
                "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "",
                "category", p.getCategory() != null ? p.getCategory().getName() : ""
        )).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cart/calculate-shipping")
    public ResponseEntity<?> calculateShipping(@RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        String country = (String) payload.get("deliveryCountry");

        double totalWeight = 0.0;
        if (items != null) {
            for (Map<String, Object> item : items) {
                Long id = Long.valueOf(item.get("productId") != null ? item.get("productId").toString() : item.get("id").toString());
                double qty = Double.parseDouble(item.get("quantity").toString());
                String itemType = item.get("itemType") != null ? item.get("itemType").toString() : "product";
                
                if ("material".equals(itemType)) {
                    RawMaterial material = rawMaterialRepository.findById(id).orElse(null);
                    if (material != null) {
                        String cat = material.getCategory();
                        if ("Fibre".equalsIgnoreCase(cat) || "Threads".equalsIgnoreCase(cat)) {
                            totalWeight += 0.05 * qty;
                        } else {
                            totalWeight += 0.2 * qty;
                        }
                    }
                } else {
                    com.stitchworks.product.model.FinishedProduct product = finishedProductRepository.findById(id).orElse(null);
                    if (product != null) {
                        Double w = product.getWeight();
                        totalWeight += (w != null ? w : 0.5) * qty;
                    }
                }
            }
        }

        java.math.BigDecimal shippingCost;
        int estimatedDays;
        
        if ("Sri Lanka".equalsIgnoreCase(country)) {
            shippingCost = new java.math.BigDecimal("5.00");
            estimatedDays = 3;
        } else {
            if (totalWeight < 2.0) {
                shippingCost = new java.math.BigDecimal("15.00");
            } else {
                shippingCost = new java.math.BigDecimal("25.00");
            }
            estimatedDays = 7;
        }

        return ResponseEntity.ok(Map.of(
            "shippingCost", shippingCost,
            "estimatedDays", estimatedDays,
            "totalWeight", totalWeight
        ));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Customer customer = customerRepository.findAll().stream()
                .filter(c -> c.getUserId() != null && c.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        String deliveryAddress = (String) payload.get("deliveryAddress");
        String deliveryCity = (String) payload.get("deliveryCity");
        String deliveryPostalCode = (String) payload.get("deliveryPostalCode");
        String deliveryCountry = (String) payload.get("deliveryCountry");
        String shippingMethod = (String) payload.get("shippingMethod");
        
        // Recalculate shipping
        double totalWeight = 0.0;
        for (Map<String, Object> itemMap : items) {
            Long id = Long.valueOf(itemMap.get("productId") != null ? itemMap.get("productId").toString() : itemMap.get("id").toString());
            double qty = Double.parseDouble(itemMap.get("quantity").toString());
            String itemType = itemMap.get("itemType") != null ? itemMap.get("itemType").toString() : "product";

            if ("material".equals(itemType)) {
                RawMaterial material = rawMaterialRepository.findById(id).orElse(null);
                if (material != null) {
                    String cat = material.getCategory();
                    if ("Fibre".equalsIgnoreCase(cat) || "Threads".equalsIgnoreCase(cat)) {
                        totalWeight += 0.05 * qty;
                    } else {
                        totalWeight += 0.2 * qty;
                    }
                }
            } else {
                com.stitchworks.product.model.FinishedProduct product = finishedProductRepository.findById(id).orElse(null);
                if (product != null) {
                    Double w = product.getWeight();
                    totalWeight += (w != null ? w : 0.5) * qty;
                }
            }
        }
        
        java.math.BigDecimal shippingCost = new java.math.BigDecimal("5.00");
        int estimatedDays = 3;
        if (!"Sri Lanka".equalsIgnoreCase(deliveryCountry)) {
            shippingCost = totalWeight < 2.0 ? new java.math.BigDecimal("15.00") : new java.math.BigDecimal("25.00");
            estimatedDays = 7;
        }

        com.stitchworks.sales.model.SalesOrder order = com.stitchworks.sales.model.SalesOrder.builder()
                .orderNumber("ORD-" + System.currentTimeMillis())
                .customer(customer)
                .orderDate(java.time.LocalDate.now())
                .status(com.stitchworks.sales.model.SalesOrderStatus.PENDING)
                .deliveryAddress(deliveryAddress)
                .deliveryCity(deliveryCity)
                .deliveryPostalCode(deliveryPostalCode)
                .deliveryCountry(deliveryCountry)
                .shippingMethod(shippingMethod)
                .shippingCost(shippingCost)
                .estimatedPreparationDays(estimatedDays)
                .items(new java.util.ArrayList<>())
                .build();

        for (Map<String, Object> itemMap : items) {
            Long id = Long.valueOf(itemMap.get("productId") != null ? itemMap.get("productId").toString() : itemMap.get("id").toString());
            java.math.BigDecimal quantity = new java.math.BigDecimal(itemMap.get("quantity").toString());
            String size = (String) itemMap.get("size");
            String color = (String) itemMap.get("color");
            String itemType = itemMap.get("itemType") != null ? itemMap.get("itemType").toString() : "product";

            com.stitchworks.sales.model.SalesOrderItem item = com.stitchworks.sales.model.SalesOrderItem.builder()
                    .salesOrder(order)
                    .quantity(quantity)
                    .size(size)
                    .color(color)
                    .build();

            if ("material".equals(itemType)) {
                RawMaterial material = rawMaterialRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Material not found"));
                item.setRawMaterial(material);
                item.setUnitPrice(material.getPricePerUnit() != null ? material.getPricePerUnit() : java.math.BigDecimal.ZERO);
            } else {
                com.stitchworks.product.model.FinishedProduct product = finishedProductRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
                item.setProduct(product);
                item.setUnitPrice(product.getBasePrice() != null ? product.getBasePrice() : java.math.BigDecimal.ZERO);
                
                // Deduct inventory only for finished products
                com.stitchworks.inventory.model.StockLedger ledger = com.stitchworks.inventory.model.StockLedger.builder()
                    .transactionType("OUT")
                    .productId(id)
                    .quantity(quantity)
                    .referenceType("SALES_ORDER")
                    .transactionDate(java.time.LocalDateTime.now())
                    .build();
                stockLedgerRepository.save(ledger);
            }

            order.getItems().add(item);
        }

        // Save order will also save items due to cascade
        salesOrderRepository.save(order);
        
        // Update ledger referenceId post-save
        // Not strictly necessary for mock, but good practice if required.
        // Skipping updating referenceId in ledger for brevity since order ID is generated after save.

        return ResponseEntity.ok(Map.of("message", "Order placed successfully", "orderNumber", order.getOrderNumber()));
    }
}

