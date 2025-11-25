## Getting Started - Local Development

First, get the servers running:

1. Start the LibrarySvc in Spring Boot by running

   ```
   ./gradlew bootRun --args='--spring.profiles.active=dev'
   ```

2. Start the LibraryUI server by running

   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### Troubleshooting Local Dev

Always:

1. Clear site data for `localhost:3000`.
2. Start Spring with dev profile, then start Next.
3. In the Developer Tools in Chrome: Login → **Network** `/api/auth/login` shows `Set-Cookie` _without_ `Domain` and **without** `Secure`.
4. **Application → Cookies →** `http://localhost:3000` has `JSESSIONID`.
5. Create/PUT media → **Network** shows `/backend/...` with `Cookie: JSESSIONID=...` and 200/204.

## Running in Production

#### Note: The first three steps are one time only

1. Be sure you have the `.env.production` file in the libraryui project directory with these values:

   ```
   NEXT_PUBLIC_LIBRARY_APP_URL=https://app.randomlake.cc
   LIBRARY_API_URL=https://api.randomlake.cc
   ```

   The libraryui project directory is `home/greg/projects/libraryui`; the service api project directory is `home/greg/projects/librarysvc`.

2. The `libraryui.service` file should exist in `~/.config/systemd/user/` with this content:

   ```
   [Unit]
   Description=LibraryUI (Pdman)
   After=network-online.target
   Wants=network-online.target

   [Service]
   Type=simple
   Restart=always
   RestartSec=5
   ExecStart=/usr/bin/podman run --name libraryui --replace \
     --env-file /home/greg/codebase/podman/libraryui/env/libraryui.env \
     --network host \
     localhost/libraryui:dev
   ExecStop=/usr/bin/podman stop -t10 libraryui
   StandardOutput=journal
   StandardError=journal


   [Install]
   WantedBy=default.target
   ```

3. Run these commands:

   ```
   systemctl --user daemon-reload
   systemctl --user enable --now libraryui.service
   ```

4. When updates are pushed to the GitLab repo, run these commands, in order, in the libraryui project directory:

   ```
   git fetch && git pull
   podman build -t localhost/libraryui:dev .
   systemctl --user restart libraryui.service
   ```

5. You can run `podman ps | grep libraryui` to verify that the service is running.

## Project Layout

```
libraryui
├── app
│   ├── api
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   └── register
│   │   │       └── route.ts
│   │   ├── cards
│   │   │   └── [cardId]
│   │   │       └── route.ts
│   │   ├── collection
│   │   │   └── media
│   │   │       └── batch
│   │   │           └── route.ts
│   │   ├── items
│   │   │   └── [code]
│   │   │       └── route.ts
│   │   ├── loans
│   │   │   ├── action
│   │   │   │   └── route.ts
│   │   │   └── history
│   │   │       └── patron
│   │   │           └── [patronId]
│   │   │               └── route.ts
│   │   ├── patrons
│   │   │   └── [patronId]
│   │   │       └── route.ts
│   │   └── ping
│   │       └── route.ts
│   ├── auth
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── register
│   │       └── page.tsx
│   ├── dashboard
│   │   ├── (overview)
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── cards
│   │   │   └── page.tsx
│   │   ├── fines
│   │   │   └── page.tsx
│   │   ├── invoices
│   │   │   ├── [id]
│   │   │   │   ├── edit
│   │   │   │   │   ├── not-found.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── loans
│   │   │   ├── checkout
│   │   │   │   └── page.tsx
│   │   │   ├── create
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── media
│   │   │   ├── [id]
│   │   │   │   ├── history
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── patrons
│   │   │   ├── [id]
│   │   │   │   ├── cards
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── history
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── reports
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── lib
│   │   ├── state-options.ts
│   │   ├── subCategoryOptions.ts
│   │   └── useDebounce.ts
│   ├── services
│   │   ├── apiClient.ts
│   │   ├── cardService.ts
│   │   ├── definitions.ts
│   │   ├── invoiceService.ts
│   │   ├── loanService.ts
│   │   ├── mediaService.ts
│   │   ├── patronService.ts
│   │   └── utils.ts
│   ├── ui
│   │   ├── cards
│   │   │   └── buttons.tsx
│   │   ├── dashboard
│   │   │   ├── nav-links.tsx
│   │   │   └── sidenav.tsx
│   │   ├── invoices
│   │   │   ├── buttons.tsx
│   │   │   ├── campaign-selector.tsx
│   │   │   ├── campaignData.ts
│   │   │   ├── create-form.tsx
│   │   │   ├── invoice-details.tsx
│   │   │   ├── status.tsx
│   │   │   └── table.tsx
│   │   ├── loans
│   │   │   └── buttons.tsx
│   │   ├── media
│   │   │   ├── buttons.tsx
│   │   │   ├── create-form.tsx
│   │   │   ├── media-details.tsx
│   │   │   ├── status.tsx
│   │   │   └── table.tsx
│   │   ├── patrons
│   │   │   ├── buttons.tsx
│   │   │   ├── create-form.tsx
│   │   │   ├── patron-details.tsx
│   │   │   ├── status.tsx
│   │   │   └── table.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── button.tsx
│   │   ├── fonts.ts
│   │   ├── global.css
│   │   ├── lib-logo.tsx
│   │   ├── login-form.tsx
│   │   ├── pagination.tsx
│   │   ├── search.tsx
│   │   └── skeletons.tsx
│   ├── _middleware.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── tree_view.py
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── Containerfile
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── plasmic.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tree_view.py
└── tsconfig.json
```
