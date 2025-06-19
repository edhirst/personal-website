# Academic Personal Website

A clean, professional static website built with React and Material-UI, designed for academics and researchers to showcase their work and research interests.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The site will be available at [http://localhost:3000](http://localhost:3000)

3. Build for production:

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Publishing on github pages

This site can be deployed to GitHub Pages using the `gh-pages` branch. Here's how to set it up:

1. Install the `gh-pages` package if you haven't already:

```bash
npm install --save-dev gh-pages
```

2. Add the following scripts to your `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Ensure your `vite.config.js` (or equivalent build config) includes the correct base path:

```js
base: '/<your-repo-name>/',
```

Replace `<your-repo-name>` with the name of your GitHub repository.

4. Deploy the site with:

```bash
npm run deploy
```

This will push the contents of the `dist` folder to the `gh-pages` branch.

### Updating the Site

Whenever you make changes, simply run:

```bash
npm run deploy
```

This will rebuild the site and update the GitHub Pages deployment.
