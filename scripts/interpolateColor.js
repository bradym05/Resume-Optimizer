/**
 * Class representing color interpolation
 * Based on: https://stackoverflow.com/a/66124172
 */
export class InterpolateColor {
    currentColor = 'rgb(0,0,0)';
    #position = 0;
    /**
     * @param {string} startColor - The start color (from)
     * @param {string} autoDisplay - The end color (to)
     * @param {Number} position - The initial position (between 0 and 1)
     */
    constructor(startColor='rgb(0,0,0)', endColor='rgb(0,0,0)', position=0) {
        /* Set params */
        this.startColor = startColor;
        this.endColor = endColor;
        // Update with starting position
        this.update(position);
    }

    #getRgb(color) {
        let [r, g, b] = color.replace('rgb(', '') //remove rgb and parenthesis
            .replace(')', '')
            .split(',') // split into values by ','
            .map(str => Number(str)); // convert to number
        // Return values
        return {r, g, b};
    }

    #interpolate() {
        // Convert rgb strings to values
        let startColorValues = this.#getRgb(this.startColor);
        let endColorValues = this.#getRgb(this.endColor);
        // Interpolate function: (v1 * (1 - alpha)) + (v2 * alpha)
        let interpolateValue = (component) => 
            Math.round((startColorValues[component] * (1 - this.#position)) + (endColorValues[component] * this.#position)).toString();
        // Return interpolated color string
        return `rgb(${interpolateValue('r')}, ${interpolateValue('g')}, ${interpolateValue('b')})`;
    }

    /**
     * Update the position, return interpolated RGB string
     * @param {Number} position - The updated position (between 0 and 1)
     */
    update(position) {
        // Update position
        this.#position = Math.max(Math.min(position, 1), 0);
        // Update current color
        this.currentColor = this.#interpolate();
    }
}