package com.ecommerce.backend.product;

import jakarta.persistence.*;


@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;
    private double price;


    // Discount percentage (e.g., 20 for 20% off)
    private double discount = 0.0;

    // Stock quantity
    private int stock = 0;

    // Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Color
    private String color;

    // Brand
    private String brand;

    // Product image URL (optional, for backward compatibility)
    private String imageUrl;

    // Product image data (stored as bytea in PostgreSQL)
    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    // Rating (1-5)
    private Integer rating;

    // Mark as new product
    @Column(name = "is_new")
    private boolean isNew = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }


    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public boolean getIsNew() { return isNew; }
    public void setIsNew(boolean isNew) { this.isNew = isNew; }
}
