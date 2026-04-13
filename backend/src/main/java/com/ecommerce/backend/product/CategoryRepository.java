package com.ecommerce.backend.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	// Find root categories (Men, Women)
	List<Category> findByParentCategoryIsNull();
}
