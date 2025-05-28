/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: "images.pexels.com",
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'dummyimage.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placekitten.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
        ],
    },

}

export default nextConfig;
