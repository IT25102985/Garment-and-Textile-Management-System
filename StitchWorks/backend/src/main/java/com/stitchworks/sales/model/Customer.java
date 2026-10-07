package com.stitchworks.sales.model;

import com.stitchworks.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String brand;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    @jakarta.persistence.Transient
    private String temporaryPassword;
}
