package net.geoffcox.agarioclone.model;

import lombok.Data;
import java.awt.Color;
import java.util.UUID;

@Data
public class Player {
    private String id;
    private String name;
    private double x;
    private double y;
    private double radius;
    private Color color;
    private double speed;
    private double score;
    private double moveX;
    private double moveY;

    public Player(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.x = Math.random() * 2000; // Random starting position
        this.y = Math.random() * 2000;
        this.radius = 20; // Starting size
        this.color = new Color(
            (int)(Math.random() * 255),
            (int)(Math.random() * 255),
            (int)(Math.random() * 255)
        );
        this.speed = 5;
        this.score = 0;
        this.moveX = 0;
        this.moveY = 0;
    }

    public void move(double dx, double dy) {
        // Store the normalized movement vector
        double length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            this.moveX = dx / length;
            this.moveY = dy / length;
        } else {
            this.moveX = 0;
            this.moveY = 0;
        }
    }

    public void updatePosition() {
        // Apply movement vector with speed
        x += moveX * speed;
        y += moveY * speed;
        
        // Keep player within world bounds
        x = Math.max(0, Math.min(x, 2000));
        y = Math.max(0, Math.min(y, 2000));
    }

    public void grow(double amount) {
        score += amount;
        radius = 20 + Math.sqrt(score); // Size grows with square root of score
    }

    public boolean collidesWith(Player other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        double distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + other.radius);
    }
} 