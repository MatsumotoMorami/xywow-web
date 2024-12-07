/** @type {import('next').NextConfig} */
const nextConfig = {
    // 配置静态资源路径
    webpack(config, { isServer }) {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                path: false,
                os: false,
            };
        }
        return config;
    },
};

export default nextConfig;
