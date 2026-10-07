package com.stitchworks.sales.controller;

import com.stitchworks.hr.model.User;
import com.stitchworks.hr.repository.UserRepository;
import com.stitchworks.sales.dto.InvoiceDto;
import com.stitchworks.sales.dto.SalesOrderDto;
import com.stitchworks.sales.dto.SalesOrderItemDto;
import com.stitchworks.sales.model.Customer;
import com.stitchworks.sales.model.Invoice;
import com.stitchworks.sales.model.SalesOrder;
import com.stitchworks.sales.model.SalesOrderItem;
import com.stitchworks.sales.repository.CustomerRepository;
import com.stitchworks.sales.repository.InvoiceRepository;
import com.stitchworks.sales.repository.SalesOrderRepository;
import com.stitchworks.sales.service.CustomerService;
import com.stitchworks.sales.service.SalesService;
import com.stitchworks.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerPortalController {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SalesService salesService;
    private final CustomerService customerService;
    private final InvoiceRepository invoiceRepository;
    private final SalesOrderRepository salesOrderRepository;

    private Customer getCurrentCustomer(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return customerRepository.findByEmail(email)
                .or(() -> customerRepository.findByUserId(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for: " + email));
    }

    @GetMapping("/profile")
    public Customer getProfile(Authentication auth) {
        return getCurrentCustomer(auth);
    }

    @PutMapping("/profile")
    public Customer updateProfile(@RequestBody Customer updated, Authentication auth) {
        Customer current = getCurrentCustomer(auth);
        return customerService.updateCustomer(current.getId(), updated);
    }

    @GetMapping("/orders")
    public List<SalesOrderDto> getMyOrders(Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        return salesService.getOrdersByCustomerId(customer.getId());
    }

    @PostMapping("/orders")
    public SalesOrderDto placeOrder(@RequestBody SalesOrderDto dto, Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        dto.setCustomerId(customer.getId());
        dto.setOrderDate(LocalDate.now());
        if (dto.getDeliveryDate() == null) {
            dto.setDeliveryDate(LocalDate.now().plusDays(7));
        }

        SalesOrderDto created = salesService.createOrder(dto);

        // Automatically generate invoice for the order
        try {
            salesService.createInvoice(created.getId(), LocalDate.now().plusDays(14));
        } catch (Exception ignored) {
        }

        return salesService.getOrderById(created.getId());
    }

    @GetMapping("/invoices")
    public List<InvoiceDto> getMyInvoices(Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        return salesService.getInvoicesByCustomerId(customer.getId());
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<?> makePayment(@PathVariable Long id, @RequestBody Map<String, Object> paymentData, Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));

        // Strict customer data security: verify invoice belongs to authenticated customer
        if (invoice.getSalesOrder() == null || invoice.getSalesOrder().getCustomer() == null ||
                !invoice.getSalesOrder().getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied: This invoice does not belong to your account."));
        }

        Object amountObj = paymentData.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment amount is required."));
        }

        BigDecimal amount = new BigDecimal(amountObj.toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment amount must be greater than 0."));
        }

        // Dummy payment simulation: do not store full card number or CVV
        InvoiceDto updated = salesService.makePayment(id, amount);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/invoices/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id, Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));

        // Security check: Customer can only download their own invoice
        if (invoice.getSalesOrder() == null || invoice.getSalesOrder().getCustomer() == null ||
                !invoice.getSalesOrder().getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).build();
        }

        SalesOrder order = invoice.getSalesOrder();
        BigDecimal total = invoice.getTotalAmount();
        BigDecimal paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remaining = total.subtract(paid).max(BigDecimal.ZERO);

        StringBuilder itemsRows = new StringBuilder();
        if (order.getItems() != null) {
            for (SalesOrderItem item : order.getItems()) {
                String pName = item.getProduct() != null ? item.getProduct().getName() : "Garment Item";
                String style = item.getProduct() != null ? item.getProduct().getStyleCode() : "-";
                String size = item.getSize() != null ? item.getSize() : "-";
                String color = item.getColor() != null ? item.getColor() : "-";
                BigDecimal lineTotal = item.getQuantity().multiply(item.getUnitPrice());

                itemsRows.append(String.format(
                        "<tr><td style='padding:10px;border-bottom:1px solid #e2e8f0;'>%s (%s)<br/><small style='color:#64748b;'>Size: %s | Color: %s</small></td>" +
                                "<td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;'>%s</td>" +
                                "<td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;'>Rs. %s</td>" +
                                "<td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;'>Rs. %s</td></tr>",
                        pName, style, size, color, item.getQuantity(), item.getUnitPrice(), lineTotal
                ));
            }
        }

        String html = "<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Invoice " + invoice.getInvoiceNumber() + "</title>" +
                "<style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b;} table{width:100%;border-collapse:collapse;margin:20px 0;} th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #cbd5e1;font-size:12px;text-transform:uppercase;color:#475569;} .total-box{float:right;width:300px;margin-top:20px;padding:15px;background:#f8fafc;border-radius:8px;} .badge{display:inline-block;padding:4px 10px;border-radius:12px;font-weight:bold;font-size:11px;} .paid{background:#dcfce7;color:#15803d;} .partially{background:#fef9c3;color:#854d0e;} .unpaid{background:#fee2e2;color:#991b1b;}</style>" +
                "</head><body>" +
                "<div style='display:flex;justify-content:space-between;border-bottom:2px solid #007AFF;padding-bottom:15px;'>" +
                "<div><h1 style='margin:0;color:#007AFF;'>StitchWorks TGMS</h1><p style='margin:4px 0;color:#64748b;'>Textile Garment Management System</p></div>" +
                "<div style='text-align:right;'><h2 style='margin:0;'>INVOICE</h2><p style='margin:4px 0;font-weight:bold;'>" + invoice.getInvoiceNumber() + "</p></div>" +
                "</div>" +
                "<div style='margin-top:25px;display:flex;justify-content:space-between;'>" +
                "<div><strong>Billed To:</strong><br/>" + customer.getName() + "<br/>" + (customer.getBrand() != null ? customer.getBrand() + "<br/>" : "") + (customer.getAddress() != null ? customer.getAddress() + "<br/>" : "") + customer.getEmail() + "</div>" +
                "<div style='text-align:right;'><strong>Order No:</strong> " + order.getOrderNumber() + "<br/><strong>Order Date:</strong> " + order.getOrderDate() + "<br/><strong>Due Date:</strong> " + (invoice.getDueDate() != null ? invoice.getDueDate() : "-") + "<br/>" +
                "<strong>Status:</strong> <span class='badge " + (invoice.getStatus().name().toLowerCase().contains("paid") && !invoice.getStatus().name().contains("partially") ? "paid" : (invoice.getStatus().name().contains("partially") ? "partially" : "unpaid")) + "'>" + invoice.getStatus().name() + "</span></div>" +
                "</div>" +
                "<table><thead><tr><th>Product Item</th><th style='text-align:center;'>Qty</th><th style='text-align:right;'>Unit Price</th><th style='text-align:right;'>Subtotal</th></tr></thead><tbody>" +
                itemsRows.toString() +
                "</tbody></table>" +
                "<div class='total-box'>" +
                "<div style='display:flex;justify-content:space-between;padding:4px 0;'><span>Invoice Total:</span><strong>Rs. " + total + "</strong></div>" +
                "<div style='display:flex;justify-content:space-between;padding:4px 0;color:#16a34a;'><span>Amount Paid:</span><strong>Rs. " + paid + "</strong></div>" +
                "<div style='display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid #cbd5e1;font-size:16px;'><span>Remaining Balance:</span><strong>Rs. " + remaining + "</strong></div>" +
                "</div>" +
                "<div style='clear:both;padding-top:40px;text-align:center;color:#94a3b8;font-size:12px;'>" +
                "<p>Thank you for doing business with StitchWorks TGMS.</p></div>" +
                "</body></html>";

        byte[] htmlBytes = html.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Invoice-" + invoice.getInvoiceNumber() + ".html\"")
                .contentType(MediaType.TEXT_HTML)
                .body(htmlBytes);
    }
    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelMyOrder(@PathVariable Long id, Authentication auth) {
        Customer customer = getCurrentCustomer(auth);
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        // Security: customer can only cancel their own orders
        if (!order.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied: this order does not belong to your account."));
        }

        // Business rule: can only cancel if not yet dispatched/shipped/delivered
        com.stitchworks.sales.model.SalesOrderStatus status = order.getStatus();
        if (status == com.stitchworks.sales.model.SalesOrderStatus.DISPATCHED ||
            status == com.stitchworks.sales.model.SalesOrderStatus.SHIPPED ||
            status == com.stitchworks.sales.model.SalesOrderStatus.DELIVERED ||
            status == com.stitchworks.sales.model.SalesOrderStatus.CANCELLED) {
            return ResponseEntity.badRequest().body(Map.of("message",
                "Order cannot be cancelled — it is already " + status.name().toLowerCase().replace('_', ' ') + "."));
        }

        order.setStatus(com.stitchworks.sales.model.SalesOrderStatus.CANCELLED);
        salesOrderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Order " + order.getOrderNumber() + " has been cancelled."));
    }
}
