import type { NextConfig } from 'next';
import path from 'path';
import withTM from 'next-transpile-modules';

const withTranspileModules = withTM(['react-syntax-highlighter']);

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  sassOptions: {
    api: 'modern',
    silenceDeprecations: ['legacy-js-api'],
    includePaths: [path.join(__dirname, 'styles')],
    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
    prependData: `
      @use 'designSystem.sass' as ds
    `,
  },
};

export default withTranspileModules(nextConfig);
