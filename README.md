# MNYALA CO. LTD: Tovuti na Mfumo wa Usimamizi

Tovuti ya umma (Kiswahili) na admin ya biashara (Kiingereza) kwa Mnyala Co. Ltd, Mbeya, Tanzania.
Stack moja: **Next.js (App Router) + TypeScript + PostgreSQL + Drizzle ORM + Tailwind CSS**.

Faili hili linaeleza: mradi umefika wapi, mfumo unatakiwa uwe vipi mwishoni, nini kimebaki, na hatua za kukamilisha.
Linaenda pamoja na `MNYALA-Build-Specification.pdf` (maelekezo kamili ya ujenzi wa mfumo mzima).

---

## 1. Hali ya sasa kwa muhtasari

**Mradi uko takriban 55% kukamilika.** Asilimia hii ni makadirio ya juhudi ya kazi, si kipimo cha hisia.

| Awamu | Hali | Uzito |
|---|---|---|
| P0 Msingi wa mradi na zana | Imekamilika, imethibitishwa | 5% |
| P1 Database, migrations, picha, seed, health check | Imekamilika, imethibitishwa | 10% |
| P2 Kuingia, ruhusa, usalama, shell ya admin | Imekamilika, imethibitishwa | 15% |
| P3 Tovuti ya umma (kurasa 6, SEO, 404, redirects) | Imekamilika, imethibitishwa | 12% |
| P4 Fomu ya mawasiliano na Messages za admin | Imekamilika, imethibitishwa | 8% |
| P5 Bidhaa na Gallery za admin | **Sehemu ya nyuma (backend) imekamilika na kupimwa. Kurasa za admin HAZIPO** | 5% kati ya 10% |
| P6 Wateja na Oda | **Haijaanza kwenye zip hii** (tazama sehemu 2) | 0% kati ya 12% |
| P7 Dashboard halisi na Ripoti | **Haijaanza kwenye zip hii** | 0% kati ya 8% |
| P8 Watumiaji, Settings, Activity log | Haijaanza (backend ya mwaliko iko, kurasa hazipo) | 0% kati ya 8% |
| P9 Usalama wa mwisho, ufikikaji, kasi | Haijaanza | 0% kati ya 7% |
| P10 Docker, backup, nyaraka za uendeshaji | Haijaanza | 0% kati ya 5% |

**Vipimo vilivyopo na vinavyopita vyote (vimeendeshwa kwenye mashine safi):**
- 384 vya unit na integration (database halisi ya PostgreSQL): `pnpm test`
- 75 vya end-to-end (server halisi ya production, cookies halisi, SMTP halisi ya majaribio): `pnpm test:e2e`
- `pnpm typecheck`, `pnpm lint --max-warnings 0`, na ukaguzi wa schema bila drift vinapita.

---

## 2. Jambo muhimu la kujua kuhusu zip hii

Wakati wa kazi, mazingira niliyokuwa nikijengea yaliwekwa upya na kazi ya **P5 (kurasa), P6 (Wateja na Oda) na P7 (Ripoti)**
iliyokuwa bado haijawekwa kwenye zip ilipotea. Kilichorudishwa na kuthibitishwa upya:
- P0 hadi P4 vyote, vikipita vipimo kwenye mashine safi.
- Sehemu ya nyuma ya P5: `src/lib/slug.ts`, `src/lib/validators/product.ts`, `src/lib/validators/gallery.ts`, `src/lib/limits.ts`,
  `src/server/services/media-service.ts`, `products-admin.ts`, `gallery-admin.ts`, pamoja na vipimo 50 vyake.
- Rasimu (draft) za actions na vipengele vya P5 ziko kwenye `docs/unfinished-p5-drafts/` (faili za `.txt`, hazijajaribiwa).
  Zimewekwa kama `.txt` makusudi ili zisivunje typecheck. Zinaweza kutumika kama mwanzo.

Hakuna chochote kwenye orodha ya "imekamilika" hapo juu ambacho hakijathibitishwa kwa vipimo kwenye zip hii.

---

## 3. Kilichokamilika na kuthibitishwa

**Tovuti ya umma** (`/`, `/kuhusu`, `/bidhaa`, `/picha`, `/wasiliana`, `/faragha`)
- Kiswahili, bila picha au fonts kutoka tovuti nyingine, bila cookies, `lang="sw"`.
- Bidhaa na picha zinatoka kwenye database; bei tupu inaonyesha "Wasiliana kwa bei".
- Picha zinahudumiwa kwa usalama kupitia `/uploads` (majina yaliyozalishwa tu, hakuna kupenya folda).
- Fomu ya mawasiliano: validation ya Kiswahili kwa kila field, namba ya simu inabadilishwa kuwa E.164, ulinzi wa spam
  (honeypot, kipimo cha muda, rate limit kwa anwani na kwa email), barua pepe ya arifa kwa biashara, ujumbe haupotei hata email ikishindwa.
- SEO: metadata kwa kila ukurasa, sitemap, robots, JSON-LD, 404 ya kirafiki isiyoelekeza kwenye admin,
  redirects za kudumu kutoka viungo vya zamani (`/about`, `/products`, `/gallery`, `/contact`, `/auth/login`).
- Kitufe cha WhatsApp kinachoelea, viungo vya `tel:` na `mailto:`.

**Usalama na kuingia (admin)**
- Hakuna usajili wa umma. Super admin wa kwanza anaundwa kwa `pnpm seed:admin` (password inaulizwa kwenye terminal).
- Sera moja ya password kila mahali (herufi 10+, herufi na namba, si password inayojulikana sana, haina email wala jina). Kuingia hakukagui nguvu ya password.
- Password: argon2id. Sessions: token ya nasibu, database inahifadhi hash yake tu; cookie `__Host-session` (HttpOnly, Secure, SameSite=Lax); siku 14 au siku 7 bila kutumika.
- Rate limit ya kuingia (kwa email na kwa anwani), kuzuia kuingia hata kwa password sahihi baada ya majaribio 5 yaliyoshindwa, majibu ya kuingia hayatofautishi sababu.
- Kusahau password: jibu ni lile lile email ikiwepo au isipokuwepo; kiungo cha mara moja, dakika 30; sessions zote zinafutwa baada ya kubadilisha.
- Ruhusa zinakaguliwa **ndani ya kila page na kila action** (si middleware peke yake); jaribio la e2e linarudia fomu za admin kwa kutumia akaunti ya staff na kuthibitisha server inakataa.
- Seva inakataa kuanza (kwa ujumbe wazi) kama usanidi si sahihi; `/api/health` inaonyesha hali ya database bila kuvuja siri.

**Admin: Messages**
- Orodha yenye tabs (All, Unread, Read, Replied), utafutaji, kurasa (20), vitendo vya kundi, ukurasa wa ujumbe mmoja
  (jibu kwa email au WhatsApp, weka "imejibiwa"), kufuta (admin na super admin tu, kunaandikwa kwenye activity log bila maandishi ya ujumbe).
- Jedwali linalogeuka kuwa kadi kwenye simu.

**Database na miundombinu**
- Majedwali 14, migrations zinazopita kwenye database tupu, check constraints (jumla ya oda, bei zisizo hasi, nk.).
- Picha: uthibitisho kwa maudhui halisi (si jina), kuondoa EXIF/mahali, ukubwa 3, haipanui picha ndogo.
- `pnpm seed:content` inaweka bidhaa 4, picha 4, mipangilio ya mawasiliano; inaweza kurudiwa bila kufuta ulichohariri.
- Logger inayoficha password, tokens na cookies. Sera ya "toleo la package lisilopungua siku 14" kwenye `pnpm-workspace.yaml`.

---

## 4. Mfumo unatakiwa uweje mwishoni

### Majukumu (roles) na ruhusa
| Uwezo | staff | admin | super_admin |
|---|---|---|---|
| Kusoma na kujibu ujumbe | Ndiyo | Ndiyo | Ndiyo |
| Kufuta ujumbe | Hapana | Ndiyo | Ndiyo |
| Wateja: kuona, kuongeza, kuhariri | Ndiyo | Ndiyo | Ndiyo |
| Wateja: kufuta (hawezi kufutwa mwenye oda) | Hapana | Ndiyo | Ndiyo |
| Oda: kuunda, kuhariri, kubadilisha hali | Ndiyo | Ndiyo | Ndiyo |
| Oda: kufuta (hali new au cancelled tu) | Hapana | Ndiyo | Ndiyo |
| Oda: kufungua tena iliyokamilika (kwa sababu iliyoandikwa) | Hapana | Hapana | Ndiyo |
| Bidhaa: kuona orodha | Ndiyo (kuona tu) | Ndiyo | Ndiyo |
| Bidhaa na Gallery: kusimamia | Hapana | Ndiyo | Ndiyo |
| Ripoti, CSV, kadi ya mapato | Hapana | Ndiyo | Ndiyo |
| Mipangilio ya tovuti (simu, WhatsApp, masaa, mitandao) | Hapana | Ndiyo | Ndiyo |
| Profile yake, password, vifaa vyake | Ndiyo | Ndiyo | Ndiyo |
| Watumiaji: kualika, kuhariri, kuzima, kufuta, role | Hapana | Hapana | Ndiyo |
| Activity log | Hapana | Hapana | Ndiyo |

Kanuni za ziada: super admin wa mwisho hawezi kufutwa, kushushwa cheo wala kuzimwa; mtu hawezi kubadilisha role yake mwenyewe; admin hawezi kugusa super admin.

### Sehemu za admin zinazotakiwa kuwepo
Dashboard (takwimu halisi na chati), Messages, Orders, Customers, Products, Gallery, Reports, Users, Settings, Activity.
Kila ukurasa: unafanya kazi kwenye simu (jedwali linakuwa kadi), una hali tupu zenye maelezo, makosa karibu na field,
uthibitisho kabla ya kufuta, hakuna kitufe kisichofanya kitu, na hakuna emoji popote (kuna test inayolinda hili).

### Mtindo wa kuonekana
Karatasi yenye joto, wino wa kijani-kiza, kijani kimoja cha Mnyala, kingo ndogo (2 hadi 6 px), mistari nyembamba badala ya vivuli,
Source Serif 4 kwa vichwa na Source Sans 3 kwa maandishi. Hakuna gradients, glass, icons kwenye miduara, wala kadi zinazofanana.
Picha halisi za kampuni tu. Rangi zote za maandishi zimepimwa kwa WCAG AA kwenye `tests/unit/contrast.test.ts`.

---

## 5. Kilichobaki, kwa undani na kwa mpangilio

### P5: Bidhaa na Gallery za admin (kurasa na actions)
Backend iko. Kinachobaki:
- Actions: `saveProductAction`, `setProductPublished`, `moveProduct`, `deleteProduct` (kuandika jina kuthibitisha), na za gallery (upload ya picha hadi 10, edit, ficha/onyesha, panga, futa).
  Kila action: `runAdminAction("admin", ...)` au `authorize("admin")`, Zod, audit log. Rasimu ziko `docs/unfinished-p5-drafts/`.
- Kurasa: `/admin/products` (staff aone tu, admin ahariri), `/admin/products/new`, `/admin/products/[id]`, `/admin/gallery`, `/admin/gallery/[id]`.
- Vipengele: kichagua picha chenye preview na ukaguzi wa ukubwa, fomu ya bidhaa, uthibitisho wa kuandika jina.
- Mipangilio: `experimental.serverActions.bodySizeLimit` iwe "55mb" kwenye `next.config.ts` (upload ya picha 10 za MB 5).
- Menyu: ongeza Products (staff) na Gallery (admin) kwenye `src/components/admin/nav.ts`.
- Vipimo: e2e ya upload halisi (faili la maandishi lililopewa jina `.jpg`, SVG, picha kubwa kupita kiasi), staff kurudia fomu ya admin na kukataliwa, picha kufutwa diskini inapofutwa bidhaa.
- Done when: admin anaongeza bidhaa na picha, inaonekana kwenye `/bidhaa`; staff hawezi kubadilisha chochote; hakuna picha iliyoachwa bila mmiliki.

### P6: Wateja na Oda
Majedwali tayari yapo (`customers`, `orders`, `order_items`, `counters`). Kinachobaki: huduma, actions, kurasa, vipimo.
Maamuzi muhimu ya kuzingatia (yalithibitishwa kabla ya kupotea):
- **Jumla ya oda haikubaliwi kamwe kutoka kwenye browser.** Huduma ya kuunda oda isiwe na hata hoja ya `totalTzs`; ihesabu kutoka kwenye mistari. Pesa ni integer ya TSh, mistari isizidi 50, jumla isizidi 2,000,000,000.
- **Nambari ya oda** `MN-<mwaka>-<nambari 4>` kutoka `counters` ndani ya transaction ile ile ya kuunda oda; mwaka kwa saa za Afrika Mashariki; jaribio la oda 25 kwa wakati mmoja lisipate nambari mbili sawa.
- **Ongeza safu `position` kwenye `order_items`** (migration mpya) ili mistari ionyeshwe kwa mpangilio ilioingizwa.
- **Hali za oda:** new -> confirmed | cancelled; confirmed -> in_delivery | cancelled; in_delivery -> completed | cancelled; completed na cancelled ni za mwisho.
  Mistari inabadilika tu kwenye new na confirmed. Kufuta oda: new au cancelled tu. Kufungua tena iliyokamilika: super admin pekee, kwa sababu ya angalau herufi 5, inaandikwa kwenye audit.
- **Wateja:** namba ya simu ya kipekee (E.164). Mteja mpya mwenye simu au email ya mteja aliyepo anaunganishwa na yule aliyepo. Mteja mwenye oda hafutiki. Matumizi ya fedha yanahesabu oda zilizokamilika tu.
- Oda inaweza kuanzishwa kutoka kwenye ujumbe wa tovuti (inajaza jina, simu, bidhaa, na kuunganisha ujumbe).
- Kurasa: `/admin/customers` (+ new, [id], [id]/edit), `/admin/orders` (tabs za hali, utafutaji, tarehe, kurasa), `/admin/orders/new`, `/admin/orders/[id]`, `/admin/orders/[id]/edit`, `/admin/orders/[id]/print` (A4, menyu inafichwa wakati wa kuchapisha).
- Fomu ya oda: mteja aliyepo au mpya, mistari yenye bidhaa inayojaza jina na bei, jumla ya papo hapo (seva inahesabu upya), na baada ya kosa fomu ijijenge upya kutoka kwa kila kilichoandikwa.
- Menyu: Orders (yenye idadi ya oda mpya) na Customers.
- Done when: safari nzima ya oda inajaribiwa e2e; staff hawezi kufuta wala kufungua tena; jumla iliyoghushiwa inapuuzwa.

### P7: Dashboard halisi na Ripoti
- Dashboard (`/admin`): kadi za ujumbe usiosomwa, oda mpya, oda za mwezi, mapato ya mwezi (admin+), wateja, bidhaa na picha zilizo kwenye tovuti; oda 5 za karibuni; ujumbe 5 wa karibuni; chati ya oda siku 30 (SVG, bila maktaba, na jedwali mbadala kwa ufikikaji); vitufe vya haraka vinavyozingatia role. Ukurasa wa sasa ni wa muda tu (salamu).
- Ripoti (`/admin/reports`, admin+): vipindi (siku 7, 30, mwezi huu, mwezi uliopita, mwaka, tarehe maalum), mapato, wastani wa oda, oda kwa hali, wateja wapya, bidhaa zinazouzwa zaidi, mapato kwa siku au mwezi.
- Kanuni za hesabu: siku zote kwa saa za Afrika Mashariki (UTC+3); **mapato ni oda zilizokamilika tu, kwa siku ya kukamilika**; masafa ni [kuanzia, kuishia) kwa instants halisi; tarehe batili inarudi siku 30.
- CSV (`/admin/reports/export?type=orders|customers`): admin+ tu, UTF-8 yenye BOM, CRLF, **seli zinazoanza na = + - @ zinakingwa dhidi ya formula injection**, kila upakuaji unaandikwa kwenye audit.
- Done when: takwimu zinalingana na data ya majaribio, mipaka ya tarehe imejaribiwa, CSV salama imejaribiwa.

### P8: Watumiaji, Settings, Activity
Backend ya mwaliko (`issueToken`, `acceptInvite`), ukurasa wa `/admin/accept-invite/[token]`, na `changePassword` vipo kwenye huduma ya auth. Kinachobaki ni kurasa na actions:
- `/admin/users` (super admin): orodha, kualika (jina, email, role) kwa email yenye kiungo cha saa 72, tuma tena mwaliko, kuhariri jina na role, kuzima, "toka kila mahali", kufuta; pamoja na ulinzi wa super admin wa mwisho.
- `/admin/settings`: profile, kubadilisha password (ya sasa + mpya, sessions nyingine zinafutwa), vifaa vilivyoingia (kuondoa kimoja), na kwa admin+: **mipangilio ya tovuti** (simu, WhatsApp, email, anwani, masaa, Facebook, Instagram, takwimu za mchango wa mazingira; takwimu tupu hazionyeshwi kwenye tovuti).
- `/admin/activity` (super admin): jedwali la shughuli lenye vichujio (mtumiaji, action, tarehe), kurasa 50.
- Kubadilisha email kunahitaji password ya sasa na kutuma taarifa kwa email ya zamani.
- Done when: safari ya mwaliko hadi kuingia imejaribiwa e2e; kila mstari wa jedwali la ruhusa umejaribiwa kwa kila role.

### P9: Usalama wa mwisho, ufikikaji na kasi
- Security headers kwenye `next.config.ts`: CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Jaribio la kuthibitisha vipo.
- Ukaguzi wa ufikikaji (axe) kwenye kurasa zote; Lighthouse (simu) angalau 90 kwa Performance, Accessibility, Best Practices, SEO kwenye kurasa 5 za umma.
- Kuondoa code isiyotumika (`knip`), `pnpm audit --prod`, `gitleaks`, ukubwa wa JavaScript ya awali chini ya 150 KB (gzip).
- Kuhakikisha hakuna kiungo kilichovunjika na hakuna kitufe kisichofanya kitu (e2e ya crawler iko kwa sehemu zilizopo).

### P10: Ufungashaji na uendeshaji
- `Dockerfile` (multi-stage, `output: "standalone"`, target ya `migrate`), `docker-compose.yml` (app, postgres, migrate), `Caddyfile` (HTTPS), `TRUST_PROXY=true`.
- Backup ya kila usiku ya database na ya folda ya uploads (siku 14, nakala ya kila wiki nje ya seva), na utaratibu wa kurejesha uliojaribiwa.
- README ya uendeshaji, ufuatiliaji wa uptime kwenye `/api/health`, CI kamili (tayari ipo: `.github/workflows/ci.yml`, haijaendeshwa kwenye GitHub halisi).
- Done when: `docker compose up` kwenye mashine safi inaleta mfumo unaofanya kazi, na restore drill imejaribiwa.

---

## 6. Mambo ambayo mmiliki anapaswa kutoa au kuthibitisha

- **Picha ya Mboji.** Picha ya zamani ilikuwa mfuko wa kampuni nyingine ("Elixir Garden Supplies"); haitumiki. Bidhaa ya Mboji haina picha hadi upate yako.
- **Picha za wafanyakazi na za mauzo ya jumla** za tovuti ya zamani hazikutumika kwa sababu haikuthibitika ni za Mnyala.
- **Takwimu za mchango wa mazingira** ("tani 500+", "wateja 1000+", nk.) na **sifa za kiufundi za mkaa** (joto, majivu, unyevu) hazijachapishwa hadi uzithibitishe.
- **Bei** za bidhaa (sasa zote zinaonyesha "Wasiliana kwa bei").
- **Nembo ya MUST** (Chuo Kikuu cha Sayansi na Teknolojia Mbeya): thibitisha kama ni mshirika kabla ya kuiweka popote.
- **Eneo kamili la ofisi** kwa ramani, mitandao ya kijamii, na masaa ya kazi.
- **Maandishi ya Faragha** (`/faragha`): yapitiwe na wewe au mwanasheria kabla ya uzinduzi.
- Nenosiri na SECRET_KEY zilizokuwa kwenye zip ya mradi wa zamani wa Flask zichukuliwe kuwa zimevuja; usizitumie popote.

---

## 7. Jinsi ya kuendesha

Mahitaji: Node.js 22 (`.nvmrc`), pnpm 12 (`corepack enable`), PostgreSQL 16.

```bash
pnpm install --frozen-lockfile
cp .env.example .env            # jaza thamani halisi; usiiweke kwenye git
createdb mnyala && createdb mnyala_test
pnpm db:migrate                 # inafanya kazi kwenye database tupu
pnpm seed:content               # bidhaa, picha, mawasiliano (salama kurudia)
pnpm seed:admin                 # super admin wa kwanza (hakuna usajili wa umma)
pnpm dev                        # http://localhost:3000
```

Production (`pnpm start`) inataka `APP_URL` ya `https://` na `MAIL_HOST`; seva inakataa kuanza kama usanidi si sahihi.
Kwa maendeleo bila SMTP, barua pepe zinaandikwa kwenye `data/outbox/*.json`.

## 8. Jinsi ya kuthibitisha

```bash
pnpm typecheck && pnpm lint --max-warnings 0
pnpm test                       # unit + integration (database ya majaribio, jina liishe na _test)
pnpm test:e2e                   # inajenga kisha inaendesha server halisi (kuna kipengele cha kujenga kwanza)
pnpm db:generate && git diff --exit-code drizzle     # schema na migrations zisitofautiane
```

Jina la `TEST_DATABASE_URL` **lazima liishe na `_test`**: majaribio yanafuta kila kitu ndani yake na yanakataa kuendesha vinginevyo.

## 9. Mpango wa kukamilisha (hatua kwa hatua)

1. Kamilisha **P5**, kisha **P6**, **P7**, **P8**, **P9**, **P10** kwa mpangilio huo. Usianze awamu mpya kabla ya vipimo vya ya sasa kupita.
2. Kila awamu: andika huduma na vipimo vyake kwanza, kisha actions na kurasa, kisha e2e inayojumuisha ruhusa za kila role.
3. Mpe AI au developer: faili hili, `MNYALA-Build-Specification.pdf` (Sehemu 5 hadi 15 na Kiambatisho A hadi D), na amri: "Kamilisha awamu iliyoanza kwenye README sehemu 5, kwa mpangilio, bila TODO, na ushahidi wa vipimo kwa kila awamu."
4. Mwishoni: pitia orodha ya Sehemu 15 ya PDF, weka mmiliki athibitishe maudhui (sehemu 6), na ujaribu kwenye vivinjari halisi.

## 10. Mambo ambayo hayajathibitishwa (mipaka ya mazingira ya ujenzi)

- **Kivinjari halisi:** muonekano ulikaguliwa kwa makadirio tu; Lighthouse, axe na majaribio ya simu halisi bado yanahitajika.
  Playwright haikuweza kutumika (upakuaji wa vivinjari ulizuiwa), kwa hiyo e2e zilizopo zinatumia mteja wa HTTP unaotuma fomu kama kivinjari kisicho na JavaScript. Tabia za JavaScript (dialog, kuongeza mstari wa oda, kuchagua picha, lightbox, kuweka ujumbe kuwa umesomwa unapofunguliwa) bado hazijajaribiwa kwenye kivinjari.
- **Barua pepe halisi:** zilijaribiwa kwa seva ya SMTP ya majaribio, si kwa mtoa huduma wako.
- **CI ya GitHub:** amri zake zimeendeshwa kwa mkono, workflow yenyewe haijaendeshwa.
- **Uwekaji kwenye seva:** Docker na HTTPS bado hazijajaribiwa (P10).

## 11. Faili muhimu

- `DECISIONS.md`: maamuzi ya kiufundi na sababu zake.
- `src/server/auth/*`, `src/server/services/*`: mantiki ya biashara na usalama.
- `src/app/(public)/*`: tovuti ya umma. `src/app/admin/*`: admin.
- `src/server/db/schema.ts` na `drizzle/*.sql`: database.
- `tests/unit`, `tests/integration`, `tests/e2e`: vipimo.
- `seed-assets/`: picha 4 zilizokubaliwa kwa seed.
- `docs/unfinished-p5-drafts/`: rasimu zisizojaribiwa za P5.
