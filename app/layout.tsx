import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '厅内互动游戏小程序',
  description: '语音厅互动游戏小程序，包含拉新互动、追分互动、双人默契猜词和才艺考核。',
  openGraph: {
    title: '厅内互动游戏小程序',
    description: '拉新互动 · 追分互动 · 双人默契猜词 · 才艺考核。',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: '厅内互动游戏小程序' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '厅内互动游戏小程序',
    description: '拉新互动 · 追分互动 · 双人默契猜词 · 才艺考核。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

