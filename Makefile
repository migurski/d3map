Grid.min.js: d3types.ts \
	         Grid.ts Core.ts Tile.ts Map.ts
	tsc --out . Grid.ts Core.ts Tile.ts Map.ts
	browserify -o Grid.bro.js --exports require Grid.js
	cat Grid.bro.js | jsmin >$@
