/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add GLSL file handling
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'raw-loader',
          options: {
            esModule: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig; 