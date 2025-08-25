import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/",
	resolve: {
		alias: {
			// eslint-disable-next-line no-undef
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor libraries
					'react-vendor': ['react', 'react-dom'],
					'ui-vendor': ['framer-motion', 'lucide-react'],
					'routing-vendor': ['react-router-dom'],
					'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend'],
					// Feature chunks
					'course-components': [
						'./src/features/courses/components/Banner',
						'./src/features/courses/components/Video',
						'./src/features/courses/components/Paragraph',
						'./src/features/courses/components/Image',
						'./src/features/courses/components/Quiz'
					],
					'shared-utils': [
						'./src/shared/utils/mediaUtils',
						'./src/shared/utils/logger'
					]
				}
			}
		},
		chunkSizeWarningLimit: 1000
	}
});
