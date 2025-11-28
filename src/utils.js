/**
 * Utilities to create displacement maps and filters.
 */

/**
 * Creates the displacement map used by the feDisplacementMap filter.
 * This creates the visual "3D edge" logic.
 */
export function getDisplacementMap({ height, width, radius, depth }) {
    const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <!-- Vertical Gradient (Top/Bottom edges) -->
            <linearGradient id="gY" x1="0" x2="0" y1="0" y2="100%">
                <stop offset="0%" stop-color="#0F0" />
                <stop offset="50%" stop-color="#808080" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
            <!-- Horizontal Gradient (Left/Right edges) -->
            <linearGradient id="gX" x1="0" x2="100%" y1="0" y2="0">
                <stop offset="0%" stop-color="#F00" />
                <stop offset="50%" stop-color="#808080" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
        </defs>

        <!-- Neutral gray base (no displacement) -->
        <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
        
        <g>
          <!-- Inner content area (flat) -->
          <rect
              x="${depth}"
              y="${depth}"
              height="${Math.max(0, height - 2 * depth)}"
              width="${Math.max(0, width - 2 * depth)}"
              fill="#808080"
              rx="${radius}"
              ry="${radius}"
          />
          
          <!-- Apply gradients to edges using blend modes to mix X and Y directions -->
           <rect x="0" y="0" height="${height}" width="${width}" fill="url(#gY)" style="mix-blend-mode: overlay" />
           <rect x="0" y="0" height="${height}" width="${width}" fill="url(#gX)" style="mix-blend-mode: overlay" />
           
           <!-- Slight blur on the map itself softens the sharp vector lines into 'liquid' curves -->
           <rect
              x="${depth / 2}"
              y="${depth / 2}"
              height="${Math.max(0, height - depth)}"
              width="${Math.max(0, width - depth)}"
              fill="none"
              stroke="#808080"
              stroke-width="${depth}"
              rx="${radius}"
              filter="blur(${depth / 2}px)"
          />
        </g>
    </svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/**
 * Creates the displacement filter URL.
 * Allows for Chromatic Aberration by splitting channels.
 */
export function getDisplacementFilter({
    height,
    width,
    radius,
    depth,
    strength = 100,
    chromaticAberration = 0
}) {
    const displacementMapUrl = getDisplacementMap({ height, width, radius, depth });

    // If chromatic aberration is requested, we run displacement twice with slight offsets
    // If not, we run a cleaner single displacement.
    let filterContent = '';

    if (chromaticAberration > 0) {
        filterContent = `
            <!-- 1. Import the Map -->
            <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMapUrl}" result="map" />
            
            <!-- 2. Distort Red Channel (Stronger) -->
            <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale="${strength + chromaticAberration * 5}"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedRed"
            />
            <feColorMatrix in="displacedRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redOnly" />
            
            <!-- 3. Distort Blue/Green Channels (Weaker) -->
            <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale="${strength - chromaticAberration * 2}"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedBlue"
            />
            <feColorMatrix in="displacedBlue" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blueGreenOnly" />
            
            <!-- 4. Merge -->
            <feBlend in="redOnly" in2="blueGreenOnly" mode="screen" />
        `;
    } else {
        filterContent = `
            <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMapUrl}" result="map" />
            <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale="${strength}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        `;
    }

    const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="displace" color-interpolation-filters="sRGB">
                ${filterContent}
            </filter>
        </defs>
    </svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
}