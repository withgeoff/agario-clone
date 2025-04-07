package net.geoffcox.agarioclone.model;

import lombok.Data;

@Data
public class MoveRequest {
    private String playerId;
    private double dx;
    private double dy;
} 