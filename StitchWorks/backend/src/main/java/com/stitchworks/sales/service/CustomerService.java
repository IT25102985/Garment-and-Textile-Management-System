package com.stitchworks.sales.service;

import com.stitchworks.hr.model.Role;
import com.stitchworks.hr.model.User;
import com.stitchworks.hr.model.UserStatus;
import com.stitchworks.hr.repository.UserRepository;
import com.stitchworks.sales.model.Customer;
import com.stitchworks.sales.repository.CustomerRepository;
import com.stitchworks.sales.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SalesOrderRepository salesOrderRepository;

    private static final String TEMP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder("Tmp@");
        for (int i = 0; i < 6; i++) {
            sb.append(TEMP_CHARS.charAt(RANDOM.nextInt(TEMP_CHARS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public Customer createCustomer(Customer customer) {
        String email = customer.getEmail() != null ? customer.getEmail().trim().toLowerCase() : null;
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Customer email is required.");
        }

        // Duplicate email validation
        if (customerRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("A customer with email (" + email + ") is already registered in the customers table.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("A user credentials account with email (" + email + ") already exists in the system.");
        }

        customer.setEmail(email);

        // Generate temporary password
        String tempPassword = generateTemporaryPassword();

        // Create linked User account for customer login
        User user = User.builder()
                .name(customer.getName())
                .email(email)
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .mustChangePassword(true)
                .phoneNumber(customer.getPhone())
                .residentialAddress(customer.getAddress())
                .build();
        user = userRepository.save(user);

        customer.setUserId(user.getId());
        customer.setActive(true);
        Customer saved = customerRepository.save(customer);

        // Transient field for one-time display to Sales Officer
        saved.setTemporaryPassword(tempPassword);
        return saved;
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer updated) {
        Customer existing = getCustomerById(id);
        String newEmail = updated.getEmail() != null ? updated.getEmail().trim().toLowerCase() : null;

        if (newEmail != null && !newEmail.equalsIgnoreCase(existing.getEmail())) {
            // Check if another customer or user has this email
            customerRepository.findByEmail(newEmail).ifPresent(c -> {
                if (!c.getId().equals(existing.getId())) {
                    throw new IllegalArgumentException("A customer account with this email already exists.");
                }
            });
            userRepository.findByEmail(newEmail).ifPresent(u -> {
                if (existing.getUserId() == null || !u.getId().equals(existing.getUserId())) {
                    throw new IllegalArgumentException("A customer account with this email already exists.");
                }
            });
            existing.setEmail(newEmail);
        }

        existing.setName(updated.getName());
        existing.setBrand(updated.getBrand());
        existing.setContactPerson(updated.getContactPerson());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());

        // Sync with user account if linked
        if (existing.getUserId() != null) {
            userRepository.findById(existing.getUserId()).ifPresent(user -> {
                user.setName(existing.getName());
                user.setEmail(existing.getEmail());
                user.setPhoneNumber(existing.getPhone());
                user.setResidentialAddress(existing.getAddress());
                userRepository.save(user);
            });
        }

        return customerRepository.save(existing);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        boolean hasOrders = !salesOrderRepository.findByCustomerId(id).isEmpty();

        if (hasOrders) {
            // Safe deactivation to preserve relational data
            customer.setActive(false);
            if (customer.getUserId() != null) {
                userRepository.findById(customer.getUserId()).ifPresent(u -> {
                    u.setStatus(UserStatus.LOCKED);
                    userRepository.save(u);
                });
            }
            customerRepository.save(customer);
        } else {
            Long userId = customer.getUserId();
            customerRepository.delete(customer);
            if (userId != null) {
                userRepository.deleteById(userId);
            }
        }
    }

    @Transactional
    public Customer toggleStatus(Long id) {
        Customer customer = getCustomerById(id);
        boolean currentActive = customer.getActive() != null ? customer.getActive() : true;
        customer.setActive(!currentActive);

        if (customer.getUserId() != null) {
            userRepository.findById(customer.getUserId()).ifPresent(u -> {
                u.setStatus(!currentActive ? UserStatus.ACTIVE : UserStatus.LOCKED);
                userRepository.save(u);
            });
        }

        return customerRepository.save(customer);
    }
}
