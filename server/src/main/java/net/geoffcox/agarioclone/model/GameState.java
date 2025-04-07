package net.geoffcox.agarioclone.model;

import lombok.Data;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.List;

@Data
public class GameState {
    private Map<String, Player> players;
    private List<Food> foods;
    private static final int WORLD_WIDTH = 2000;
    private static final int WORLD_HEIGHT = 2000;
    private static final int MAX_FOOD = 100;

    public GameState() {
        this.players = new ConcurrentHashMap<>();
        this.foods = new ArrayList<>();
        initializeFood();
    }

    private void initializeFood() {
        for (int i = 0; i < MAX_FOOD; i++) {
            double x = Math.random() * WORLD_WIDTH;
            double y = Math.random() * WORLD_HEIGHT;
            foods.add(new Food(x, y));
        }
    }

    public void addPlayer(Player player) {
        players.put(player.getId(), player);
    }

    public void removePlayer(String playerId) {
        players.remove(playerId);
    }

    public void updateFood() {
        // Remove eaten food and add new food
        foods.removeIf(food -> {
            for (Player player : players.values()) {
                double dx = food.getX() - player.getX();
                double dy = food.getY() - player.getY();
                double distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < player.getRadius()) {
                    player.grow(food.getValue());
                    return true;
                }
            }
            return false;
        });

        // Add new food if needed
        while (foods.size() < MAX_FOOD) {
            double x = Math.random() * WORLD_WIDTH;
            double y = Math.random() * WORLD_HEIGHT;
            foods.add(new Food(x, y));
        }
    }

    public void checkPlayerCollisions() {
        List<String> playersToRemove = new ArrayList<>();
        
        for (Player player1 : players.values()) {
            for (Player player2 : players.values()) {
                if (player1.getId().equals(player2.getId())) continue;
                
                if (player1.collidesWith(player2)) {
                    // Larger player eats smaller player
                    if (player1.getRadius() > player2.getRadius()) {
                        player1.grow(player2.getScore());
                        playersToRemove.add(player2.getId());
                    } else {
                        player2.grow(player1.getScore());
                        playersToRemove.add(player1.getId());
                    }
                }
            }
        }
        
        playersToRemove.forEach(this::removePlayer);
    }
} 