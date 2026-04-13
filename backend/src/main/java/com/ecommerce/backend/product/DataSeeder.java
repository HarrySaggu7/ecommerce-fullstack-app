package com.ecommerce.backend.product;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.File;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            File lock = new File("seed.lock");
            if (!lock.exists()) {
                categoryRepository.deleteAll();

                // --- WOMEN ---
                Category women = new Category();
                women.setName("Women");
                categoryRepository.save(women);

                // Indian & Western Wear
                Category indianWestern = new Category();
                indianWestern.setName("Indian & Western Wear");
                indianWestern.setParentCategory(women);
                categoryRepository.save(indianWestern);

                categoryRepository.save(makeSub("Kurtas & Suits", indianWestern));
                categoryRepository.save(makeSub("Kurtis & Tunics", indianWestern));
                categoryRepository.save(makeSub("Leggings, Salwars & Churidars", indianWestern));
                categoryRepository.save(makeSub("Skirts & Palazzos", indianWestern));
                categoryRepository.save(makeSub("Sarees & Blouses", indianWestern));
                categoryRepository.save(makeSub("Dress Material", indianWestern));
                categoryRepository.save(makeSub("Lehenga Choli", indianWestern));
                categoryRepository.save(makeSub("Dupattas & Shawls", indianWestern));

                // Western Wear
                Category westernWear = new Category();
                westernWear.setName("Western Wear");
                westernWear.setParentCategory(women);
                categoryRepository.save(westernWear);

                categoryRepository.save(makeSub("Dresses & Jumpsuits", westernWear));
                categoryRepository.save(makeSub("Tops, T-Shirts & Shirts", westernWear));
                categoryRepository.save(makeSub("Jeans & Jeggings", westernWear));
                categoryRepository.save(makeSub("Trousers & Capris", westernWear));
                categoryRepository.save(makeSub("Shorts & Skirts", westernWear));
                categoryRepository.save(makeSub("Shrugs", westernWear));
                categoryRepository.save(makeSub("Sweaters & Sweatshirts", westernWear));
                categoryRepository.save(makeSub("Jackets & Waistcoats", westernWear));
                categoryRepository.save(makeSub("Coats & Blazers", westernWear));

                // Accessories
                Category womenAccessories = new Category();
                womenAccessories.setName("Accessories");
                womenAccessories.setParentCategory(women);
                categoryRepository.save(womenAccessories);

                Category womenWatches = new Category();
                womenWatches.setName("Women Watches");
                womenWatches.setParentCategory(womenAccessories);
                categoryRepository.save(womenWatches);
                categoryRepository.save(makeSub("Analog", womenWatches));
                categoryRepository.save(makeSub("Chronograph", womenWatches));
                categoryRepository.save(makeSub("Digital", womenWatches));
                categoryRepository.save(makeSub("Analog & Digital", womenWatches));

                categoryRepository.save(makeSub("Sunglasses", womenAccessories));
                categoryRepository.save(makeSub("Eye Glasses", womenAccessories));
                categoryRepository.save(makeSub("Belt", womenAccessories));

                // --- MEN ---
                Category men = new Category();
                men.setName("Men");
                categoryRepository.save(men);

                // Clothing
                Category menClothing = new Category();
                menClothing.setName("Clothing");
                menClothing.setParentCategory(men);
                categoryRepository.save(menClothing);

                categoryRepository.save(makeSub("T-Shirts", menClothing));
                categoryRepository.save(makeSub("Casual Shirts", menClothing));
                categoryRepository.save(makeSub("Formal Shirts", menClothing));
                categoryRepository.save(makeSub("Suits", menClothing));
                categoryRepository.save(makeSub("Jeans", menClothing));
                categoryRepository.save(makeSub("Casual Trousers", menClothing));
                categoryRepository.save(makeSub("Formal Trousers", menClothing));
                categoryRepository.save(makeSub("Shorts", menClothing));
                categoryRepository.save(makeSub("Track Pants", menClothing));
                categoryRepository.save(makeSub("Sweaters & Sweatshirts", menClothing));
                categoryRepository.save(makeSub("Jackets", menClothing));
                categoryRepository.save(makeSub("Blazers & Coats", menClothing));
                categoryRepository.save(makeSub("Sports & Active Wear", menClothing));
                categoryRepository.save(makeSub("Indian & Festive Wear", menClothing));
                categoryRepository.save(makeSub("Innerwear & Sleepwear", menClothing));

                // Accessories
                Category menAccessories = new Category();
                menAccessories.setName("ACCESSORIES");
                menAccessories.setParentCategory(men);
                categoryRepository.save(menAccessories);

                categoryRepository.save(makeSub("Watches & Wearables", menAccessories));
                categoryRepository.save(makeSub("Sunglasses & Frames", menAccessories));
                categoryRepository.save(makeSub("Bags & Backpacks", menAccessories));
                categoryRepository.save(makeSub("Luggage & Trolleys", menAccessories));
                categoryRepository.save(makeSub("Personal Care & Grooming", menAccessories));
                categoryRepository.save(makeSub("Wallets & Belts", menAccessories));
                categoryRepository.save(makeSub("Fashion Accessories", menAccessories));

                lock.createNewFile();
            }
        };
    }

    private Category makeSub(String name, Category parent) {
        Category c = new Category();
        c.setName(name);
        c.setParentCategory(parent);
        return c;
    }
}
