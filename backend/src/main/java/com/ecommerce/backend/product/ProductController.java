package com.ecommerce.backend.product;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    // Image upload endpoint
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }
        try {
            String uploadsDir = "uploads/";
            String realPath = System.getProperty("user.dir") + "/backend/" + uploadsDir;
            Files.createDirectories(Paths.get(realPath));
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(realPath, filename);
            file.transferTo(filePath);
            String imageUrl = "/api/products/image/" + filename;
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
        }
    }

    // Serve uploaded images
    @GetMapping("/image/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) throws IOException {
        String uploadsDir = "uploads/";
        String realPath = System.getProperty("user.dir") + "/backend/" + uploadsDir + filename;
        Path path = Paths.get(realPath);
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        byte[] image = Files.readAllBytes(path);
        return ResponseEntity.ok()
            .header("Content-Type", Files.probeContentType(path))
            .header("Cache-Control", "public, max-age=604800, immutable") // 7 days
            .body(image);
    }
}
