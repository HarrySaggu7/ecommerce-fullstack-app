package com.ecommerce.backend.product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;


    public Product addProduct(Product product) {
        // Optionally validate category, color, brand, rating here
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }


    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> filterProducts(String keyword, String color, String brand, Integer rating) {
        // Convert empty strings and 'null' string to null for optional params
        if (keyword != null && (keyword.isEmpty() || keyword.equalsIgnoreCase("null"))) keyword = null;
        if (color != null && (color.isEmpty() || color.equalsIgnoreCase("null"))) color = null;
        if (brand != null && (brand.isEmpty() || brand.equalsIgnoreCase("null"))) brand = null;
        // If rating is 0 or null, ignore it
        if (rating != null && rating == 0) rating = null;
        return productRepository.filterProducts(keyword, color, brand, rating);
    }


    public Product updateProduct(Product product) {
        // Optionally validate category, color, brand, rating here
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
