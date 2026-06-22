import { OMSSServer } from '@omss/framework';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { knownThirdPartyProxies } from './thirdPartyProxies.js';
import { streamPatterns } from './streamPatterns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const server = new OMSSServer({
        name: 'StarLight',
        version: '1.0.0',

        // Network
        host: process.env.HOST ?? 'localhost',
        port: Number(process.env.PORT ?? 3000),
        publicUrl: process.env.PUBLIC_URL,

        // Cache (memory for dev, Redis for prod)
        cache: {
            type: (process.env.CACHE_TYPE as 'memory' | 'redis') ?? 'memory',
            ttl: {
                sources: 60 * 60,
                subtitles: 60 * 60 * 24
            },
            redis: {
                host: process.env.REDIS_HOST ?? 'localhost',
                port: Number(process.env.REDIS_PORT ?? 6379),
                password: process.env.REDIS_PASSWORD
            }
        },

        // TMDB
        tmdb: {
            apiKey: process.env.TMDB_API_KEY!,
            cacheTTL: 24 * 60 * 60 // 24h
        },

        // Third Party Proxy removal
        proxyConfig: {
            knownThirdPartyProxies: knownThirdPartyProxies,
            streamPatterns
        },

        cors: {
            origin: process.env.CORS_ORIGIN ?? '*',
            methods: ['GET', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Range', 'Accept-Ranges', 'ETag'],
            preflightContinue: false,
            optionsSuccessStatus: 204
        },

        stremio: {
            // exposes a stremio addon on /stremio/manifest.json
            enableNativeAddon: process.env.STREMIO_ADDON === 'true',
            // you can your own custom stremio addons as sources into starlight.
            stremioAddons: []
            /*
            stremioAddons: [
                {
                    id: 'some-unique-id',
                    url: 'https://example.com/manifest.json',
                    enabled: true
                }
            ]
            */
        },

        // MCP for AI agents
        mcp: {
            enabled: process.env.MCP_ENABLED === 'true'
        }
    });

    // Register providers
    const registry = server.getRegistry();
    await registry.discoverProviders(path.join(__dirname, './providers/'));

    await server.start();

    const publicUrl =
        process.env.PUBLIC_URL ??
        `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 3000}`;

    const uiUrl = `${process.env.PUBLIC_URL ?? `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 3000}`}/ui`;

    const title = '🚀 StarLight is ready!';
    const contrib =
        '🤝 We are looking for contributors to improve and develop!';
    const repo = 'Contribute: https://github.com/MaheshSharan/star-core';
    const tryIt = `🌐 Try it out: ${uiUrl} !`;

    const lines = [title, '', repo, '', contrib, '', tryIt];

    const width = Math.max(...lines.map((l) => l.length)) + 2;

    const borderTop = '╭' + '─'.repeat(width) + '╮';
    const borderBottom = '╰' + '─'.repeat(width) + '╯';

    const pad = (line: string) => '│ ' + line.padEnd(width - 2, ' ') + ' │';

    console.log(`
${borderTop}
${lines.map(pad).join('\n')}
${borderBottom}
`);
}

main().catch(() => {
    process.exit(1);
});
