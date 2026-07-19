# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 🌍 Deployment Notes

### Netlify (Current)
This project is currently configured for Netlify root deployment. No special path configurations are required in `astro.config.mjs` or within the application files (absolute paths like `/about` are used).

### GitHub Pages (Subpath Deployment)
If you ever switch back to deploying on GitHub Pages (which hosts from a subpath like `/fob_birding-club/`), you must apply the following changes:

1. **Update `astro.config.mjs`:**
   Add your `site` and `base` settings:
   ```javascript
   export default defineConfig({
     site: 'https://<your-username>.github.io',
     base: '/fob_birding-club',
   });
   ```

2. **Normalize Base URLs in Code:**
   In your layouts and navigation components (e.g., `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `index.astro`), you must read the base path and prefix your links, otherwise they will break and point to the domain root instead of your subpath repository:
   
   ```astro
   ---
   // Read base path from Astro's env
   const base = import.meta.env.BASE_URL.replace(/\/$/, '');
   ---
   
   <!-- Prefix all links and asset paths -->
   <a href={`${base}/about`}>About</a>
   <img src={`${base}/images/logo.png`} />
   ```
