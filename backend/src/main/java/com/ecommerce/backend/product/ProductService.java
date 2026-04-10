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

    public List<Product> filterProducts(String keyword, String color, String brand, Integer rating, String category) {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(p -> keyword == null || keyword.isEmpty() || p.getName().toLowerCase().contains(keyword.toLowerCase()))
                .filter(p -> color == null || color.isEmpty() || (p.getColor() != null && p.getColor().equalsIgnoreCase(color)))
                .filter(p -> brand == null || brand.isEmpty() || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand)))
                .filter(p -> rating == null || rating == 0 || (p.getRating() != null && p.getRating().equals(rating)))
                .filter(p -> category == null || category.isEmpty() || (p.getCategory() != null && p.getCategory().getName() != null && p.getCategory().getName().equalsIgnoreCase(category)))
                .toList();
    }

    public List<Product> getNewProducts() {
        return productRepository.findByIsNewTrue();
    }


    public Product updateProduct(Product product) {
        // Optionally validate category, color, brand, rating here
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
