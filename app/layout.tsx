import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '厅内互动游戏小程序',
  description: '语音厅互动游戏计分小程序，包含拉新互动与追分互动，支持动态麦位、自动计分和自定义倒计时。',
  openGraph: {
    title: '厅内互动游戏小程序',
    description: '拉新互动 · 追分互动，动态麦位、自动计分和自定义倒计时。',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: '厅内互动游戏小程序' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '厅内互动游戏小程序',
    description: '拉新互动 · 追分互动，动态麦位、自动计分和自定义倒计时。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

