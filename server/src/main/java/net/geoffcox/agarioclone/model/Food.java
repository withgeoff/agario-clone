package net.geoffcox.agarioclone.model;

import lombok.Data;
import java.awt.Color;
import java.util.UUID;

@Data
public class Food {
    private String id;
    private double x;
    private double y;
    private double radius;
    private Color color;
    private double value;

    public Food(double x, double y) {
        this.id = UUID.randomUUID().toString();
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = new Color(
            (int)(Math.random() * 255),
            (int)(Math.random() * 255),
            (int)(Math.random() * 255)
        );
        this.value = 1.0;
    }
} 