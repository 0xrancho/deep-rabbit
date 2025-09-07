import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// GABI brand colors
				gabi: {
					purple: 'hsl(var(--gabi-purple))',
					pink: 'hsl(var(--gabi-pink))',
				},
				
				// User accent colors
				'user-accent': {
					DEFAULT: 'hsl(var(--user-accent))',
					bright: 'hsl(var(--user-accent-bright))',
				},
				
				// Text colors
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
				'text-muted': 'hsl(var(--text-muted))',
				
				// Semantic colors
				success: 'hsl(var(--success))',
				error: 'hsl(var(--error))',
				warning: 'hsl(var(--warning))',
				
				// Glass morphism
				glass: {
					bg: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))',
					highlight: 'hsl(var(--glass-highlight))',
				},
				
				// Interactive elements
				interactive: {
					bg: 'hsl(var(--interactive-bg))',
					border: 'hsl(var(--interactive-border))',
					hover: 'hsl(var(--interactive-hover))',
				},
				
				// Input fields
				'input-bg': 'hsl(var(--input-bg))',
				'input-border': 'hsl(var(--input-border))',
				
				// Cards
				'card-bg': 'hsl(var(--card-bg))',
				'card-border': 'hsl(var(--card-border))',
				
				// Progress
				'progress-bg': 'hsl(var(--progress-bg))',
				
				// Keep shadcn colors for compatibility
				primary: {
					DEFAULT: 'hsl(var(--gabi-purple))',
					foreground: 'hsl(var(--text-primary))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--interactive-bg))',
					foreground: 'hsl(var(--text-secondary))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--error))',
					foreground: 'hsl(var(--text-primary))'
				},
				muted: {
					DEFAULT: 'hsl(var(--interactive-bg))',
					foreground: 'hsl(var(--text-muted))'
				},
				accent: {
					DEFAULT: 'hsl(var(--user-accent))',
					foreground: 'hsl(var(--text-primary))'
				},
				popover: {
					DEFAULT: 'hsl(var(--card-bg))',
					foreground: 'hsl(var(--text-primary))'
				},
				card: {
					DEFAULT: 'hsl(var(--card-bg))',
					foreground: 'hsl(var(--text-primary))'
				},
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)'
			},
			keyframes: {
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--gabi-purple) / 0.3)' },
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--gabi-purple) / 0.6), 0 0 30px hsl(var(--gabi-pink) / 0.4)' 
					}
				},
				'gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'gradient': 'gradient 3s ease infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
