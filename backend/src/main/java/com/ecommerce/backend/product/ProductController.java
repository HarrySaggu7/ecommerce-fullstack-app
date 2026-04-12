package com.ecommerce.backend.product;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.io.IOException;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    @Autowired
    private ProductService productService;

    ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }



    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }


    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return productService.updateProduct(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productService.searchProducts(keyword);
    }

    @GetMapping("/filter")
    public List<Product> filterProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String category) {
        try {
            System.out.println("[DEBUG] /filter called with: keyword='" + keyword + "', color='" + color + "', brand='" + brand + "', rating=" + rating + ", category='" + category + "'");
            return productService.filterProducts(keyword, color, brand, rating, category);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/new")
    public List<Product> getNewProducts() {
        return productService.getNewProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }


    // Image upload endpoint (store in PostgreSQL)
    @PostMapping("/upload-image/{productId}")
    public ResponseEntity<String> uploadImage(@PathVariable Long productId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }
        try {
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
            }
            product.setImageData(file.getBytes());
            product.setImageUrl(file.getOriginalFilename()); // Optional: store original filename
            productRepository.save(product);
            String imageUrl = "/api/products/image-by-id/" + productId;
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
        }
    }


    // Serve image from PostgreSQL by product ID
    @GetMapping("/image-by-id/{productId}")
    public ResponseEntity<byte[]> getImageById(@PathVariable Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null || product.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        // Try to guess content type from filename
        String contentType = "application/octet-stream";
        String filename = product.getImageUrl();
        if (filename != null) {
            if (filename.endsWith(".png")) contentType = "image/png";
            else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (filename.endsWith(".webp")) contentType = "image/webp";
        }
        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Cache-Control", "public, max-age=604800, immutable") // 7 days
            .body(product.getImageData());
    }
}
