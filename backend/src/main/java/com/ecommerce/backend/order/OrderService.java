package com.ecommerce.backend.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;
import com.ecommerce.backend.product.Product;
import com.ecommerce.backend.product.ProductRepository;
import com.ecommerce.backend.user.UserRepository;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;


    @Autowired
    private OrderEmailService orderEmailService;

    @Autowired
    private com.ecommerce.backend.user.UserRepository userRepository;

    public Order placeOrder(Order order) {
        // Fetch full user entity from DB to ensure email is present
        if (order.getUser() != null && order.getUser().getId() != null) {
            order.setUser(userRepository.findById(order.getUser().getId()).orElse(order.getUser()));
        }
        logger.info("Placing order for user: {} (id={})", order.getUser() != null ? order.getUser().getEmail() : null, order.getUser() != null ? order.getUser().getId() : null);
        // Replace product stubs with managed entities
        if (order.getProducts() != null && !order.getProducts().isEmpty()) {
            List<Product> managedProducts = order.getProducts().stream()
                .map(p -> productRepository.findById(p.getId()).orElse(null))
                .filter(p -> p != null)
                .collect(Collectors.toList());
            order.setProducts(managedProducts);
        }
        Order savedOrder = orderRepository.save(order);
        logger.info("Order saved with id: {} for user id: {}", savedOrder.getId(), savedOrder.getUser() != null ? savedOrder.getUser().getId() : null);
        // Send confirmation email if user has email
        if (savedOrder.getUser() != null && savedOrder.getUser().getEmail() != null) {
            StringBuilder details = new StringBuilder();
            details.append("Order ID: ").append(savedOrder.getId()).append("\n");
            details.append("Total: ").append(savedOrder.getTotal()).append("\n");
            details.append("Status: ").append(savedOrder.getStatus()).append("\n");
            details.append("Products: ");
            if (savedOrder.getProducts() != null) {
                for (Product p : savedOrder.getProducts()) {
                    details.append("\n - ").append(p.getName());
                }
            }
            orderEmailService.sendOrderConfirmation(savedOrder.getUser().getEmail(), details.toString());
        }
        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
