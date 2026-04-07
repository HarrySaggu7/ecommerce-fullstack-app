package com.ecommerce.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE " +
            "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:color IS NULL OR (p.color IS NOT NULL AND LOWER(p.color) = LOWER(:color))) AND " +
            "(:brand IS NULL OR (p.brand IS NOT NULL AND LOWER(p.brand) = LOWER(:brand))) AND " +
            "(:rating IS NULL OR p.rating = :rating)")
    List<Product> filterProducts(@Param("keyword") String keyword,
                                 @Param("color") String color,
                                 @Param("brand") String brand,
                                 @Param("rating") Integer rating);

    // Find all products marked as new
    List<Product> findByIsNewTrue();
}
