package com.ecommerce.backend.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.ecommerce.backend.product.Product;
import com.ecommerce.backend.product.ProductRepository;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order placeOrder(Order order) {
        // Replace product stubs with managed entities
        if (order.getProducts() != null && !order.getProducts().isEmpty()) {
            List<Product> managedProducts = order.getProducts().stream()
                .map(p -> productRepository.findById(p.getId()).orElse(null))
                .filter(p -> p != null)
                .collect(Collectors.toList());
            order.setProducts(managedProducts);
        }
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
