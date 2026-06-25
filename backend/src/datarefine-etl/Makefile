build-DataRefineETLFunction:
	npm install
	npx esbuild app.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=$(ARTIFACTS_DIR)/app.js
	cp package.json $(ARTIFACTS_DIR)/
