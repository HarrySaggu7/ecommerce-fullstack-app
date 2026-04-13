package com.ecommerce.backend.product;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        // Return only root categories (Men, Women) with their subcategories
        return categoryRepository.findByParentCategoryIsNull();
    }

    @PostMapping
    public Category addCategory(@RequestBody Category category) {
        // If parentCategory is provided, fetch and set it
        if (category.getParentCategory() != null && category.getParentCategory().getId() != null) {
            Category parent = categoryRepository.findById(category.getParentCategory().getId()).orElse(null);
            category.setParentCategory(parent);
        }
        return categoryRepository.save(category);
    }
}
