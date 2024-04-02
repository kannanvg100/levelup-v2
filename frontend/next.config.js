/** @type {import('next').NextConfig} */

module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
            },
        ]
    },
    images: {
        // domains: ['levelup.s3.ap-south-1.amazonaws.com', 'lh3.googleusercontent.com', 'image.mux.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'levelup.s3.ap-south-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'image.mux.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
        })
        return config
    },
    reactStrictMode: false
}
