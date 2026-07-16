package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Vendor;
import com.cms.repository.VendorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public Vendor saveVendor(Vendor vendor) {
        checkAdminOrAccountant();
        vendor.setId(generateVendorId());
        if (vendor.getStatus() == null || vendor.getStatus().isBlank()) {
            vendor.setStatus("Active");
        }
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(String id) {
        return vendorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
    }

    public Vendor updateVendor(String id, Vendor updatedVendor) {
        checkAdminOrAccountant();
        Vendor vendor = getVendorById(id);
        
        vendor.setName(updatedVendor.getName());
        vendor.setContactPerson(updatedVendor.getContactPerson());
        vendor.setPhoneNumber(updatedVendor.getPhoneNumber());
        vendor.setEmail(updatedVendor.getEmail());
        vendor.setAddress(updatedVendor.getAddress());
        vendor.setStatus(updatedVendor.getStatus());
        
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(String id) {
        checkAdminOrAccountant();
        if (!vendorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found");
        }
        vendorRepository.deleteById(id);
    }

    private void checkAdminOrAccountant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        boolean hasRole = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_ACCOUNTANT") || 
                               a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ACCOUNTANT"));
        
        if (!hasRole) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin and Accountant can manage vendors.");
        }
    }

    private String generateVendorId() {
        String id;
        do {
            id = "VEN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (vendorRepository.existsById(id));

        return id;
    }
}
