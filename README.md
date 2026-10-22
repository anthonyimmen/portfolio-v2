### portfolio-v2

- a curated portfolio and hand-designed by anthony immenschuh.
- figma designs are available viewing [here](https://www.figma.com/design/5s76kjnKtn8FCxoFsLtDzi/portfolio?node-id=0-1&t=fQ1KoIe59zlWIFDu-1)

Use Node.js 24.22.1 from the repository's `.nvmrc`:

```sh
nvm install
nvm use
cd portfolio-v2
npm ci
npm run dev
```

The app's `engines.node` declares Node 24.22.1 as the minimum and selects the
Node 24 release line for Vercel builds. Vercel manages its patch rollout;
verify the running version after deploying. Use `npm run lint` and
`npm run build` before opening a PR.

#### preview

<img width="860" height="869" alt="Screenshot 2026-02-05 at 5 15 00 PM" src="https://github.com/user-attachments/assets/fad26159-f346-4177-9038-9ea94ecba8e3" />
