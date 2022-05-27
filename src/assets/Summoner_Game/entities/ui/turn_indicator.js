class Turn_indicator {
    constructor() {}

    render(ctx, zoom, teamName, teamColor, mouseX, mouseY, canvasWidth, canvasHeight) {
        let xOrigin = canvasWidth - (96 * zoom);
        let yOrigin = 2 * zoom;
        let width = 94 * zoom;
        let height = 30 * zoom;

        if (mouseX > (canvasWidth / 2) && mouseY < (48 * zoom)) yOrigin = canvasHeight - (height + 2 * zoom);

        ctx.fillStyle = teamColor;
        ctx.fillRect(xOrigin, yOrigin, width, height);

        ctx.fillStyle = "rgba(255, 230, 230, 0.8)"
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(teamName.toUpperCase(), xOrigin + width / 2, yOrigin + height / 2);
    }
}

export { Turn_indicator };