# Portfolio — Sound Design & Game Music

Stack : **Next.js 16** · **Sanity v3** · **Lenis** · **Motion** · **Zustand** · **Howler.js** · **Tailwind CSS v4**

## Démarrage

### 1. Variables d'environnement
```bash
cp .env.local.example .env.local
```

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage → ton projet |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` par défaut |
| `SANITY_API_READ_TOKEN` | Manage → API → Tokens → créer un token *read* |

### 2. Dev
```bash
npm install && npm run dev
```
- Site : http://localhost:3000
- Studio : http://localhost:3000/studio

## Architecture
```
src/
├── app/
│   ├── (site)/                  # Pages publiques
│   │   ├── page.tsx             # Home
│   │   ├── projects/page.tsx    # Listing
│   │   ├── projects/[slug]/     # Page projet + TrackList
│   │   └── about/page.tsx
│   ├── (studio)/studio/         # Sanity Studio embarqué
│   └── layout.tsx               # LenisProvider + GlobalPlayer
├── components/
│   ├── audio/GlobalPlayer.tsx   # Player fixe, survit aux transitions
│   ├── layout/LenisProvider.tsx # Instance Lenis centralisée
│   ├── layout/Navbar.tsx
│   └── transitions/PageTransition.tsx  # Effet aquatique SVG
├── hooks/useScrollReveal.ts
├── store/audioStore.ts          # Zustand + Howler.js
├── sanity/
│   ├── lib/{client,image,queries}.ts
│   └── schemas/{project,about,settings}.ts
└── types/index.ts
```

## Ajouter GSAP plus tard (sans casser quoi que ce soit)

```bash
npm install gsap
```

Dans `LenisProvider.tsx`, remplace le commentaire existant par :
```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => { lenis.raf(time * 1000) })
gsap.ticker.lagSmoothing(0)
// + supprimer le bloc requestAnimationFrame natif
```

## TODOs
- [ ] `@portabletext/react` pour les blocs bio / description
- [ ] Décommenter les `<Image>` avec `urlFor()`
- [ ] `generateMetadata` sur les pages slug (SEO dynamique)
- [ ] Mux ou Cloudinary pour les fichiers audio lourds (> 10 MB)
