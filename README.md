<div align="center">
  <h3 align="center">Volery</h3>
  <img src="public/1fab6.svg" alt="Logo" width="200" height="200">
  <p align="center">
    Volery is a time-saving package batch installation script generator for Arch
    Linux or Arch-Based distro users. Package lists from the
    <a href="https://archlinux.org/packages/">Arch Linux Official Repository</a> and the
    <a href="https://aur.archlinux.org">Arch User Repository (AUR)</a> are updated once per hour.
    <br />
    <br />
    <a href="https://volery-elliotwutingfeng.vercel.app">View Live Demo</a>
    ·
    <a href="https://github.com/elliotwutingfeng/Volery/issues">Report Bug</a>
    ·
    <a href="https://github.com/elliotwutingfeng/Volery/issues">Request Feature</a>
  </p>
  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/NextJS-1C1C1C?style=for-the-badge&logo=nextdotjs&logoColor=ffffff" alt="NextJS"/></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase"/></a>
    <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-1C1C1C?style=for-the-badge&logo=vercel&logoColor=ffffff" alt="Vercel"/></a>
    <a href="https://archlinux.org"><img src="https://img.shields.io/badge/Arch_Linux-1C1C1C?style=for-the-badge&logo=archlinux&logoColor=1793D1" alt="Arch Linux"/></a>
    <a href="https://github.com/elliotwutingfeng/Volery/actions"><img src="https://img.shields.io/badge/GitHub_Actions-1C1C1C?style=for-the-badge&logo=github-actions&logoColor=2088FF" alt="GitHub Actions"/></a>
  </p>
  <p align="center">
    <a href="https://github.com/elliotwutingfeng/Volery/stargazers"><img src="https://img.shields.io/github/stars/elliotwutingfeng/Volery?style=for-the-badge" alt="GitHub stars"/></a>
    <a href="https://github.com/elliotwutingfeng/Volery/watchers"><img src="https://img.shields.io/github/watchers/elliotwutingfeng/Volery?style=for-the-badge" alt="GitHub watchers"/></a>
    <a href="https://github.com/elliotwutingfeng/Volery/network/members"><img src="https://img.shields.io/github/forks/elliotwutingfeng/Volery?style=for-the-badge" alt="GitHub forks"/></a>
    <a href="https://github.com/elliotwutingfeng/Volery/issues"><img src="https://img.shields.io/github/issues/elliotwutingfeng/Volery?style=for-the-badge" alt="GitHub issues"/></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/LICENSE-APACHE-GREEN?style=for-the-badge" alt="GitHub license"/></a>
    <a href="https://github.com/elliotwutingfeng/Volery/actions/workflows/scraper.yml"><img src="https://img.shields.io/github/workflow/status/elliotwutingfeng/Volery/scraper?label=REPO%20SYNC&style=for-the-badge"/></a>
  </p>
</div>

---

## How to use Volery

1. 🔍 Search for your favourite packages.
2. 📋 Copy the batch installation script to your clipboard.
3. 💻 Voilà! Now paste it into your terminal and install your packages!

## How Volery works

- Using GitHub Actions + Python & Supabase API, package lists from the [Arch Linux Official Repository](https://archlinux.org/packages/) and the [Arch User Repository (AUR)](https://aur.archlinux.org) are mirrored to a PostgreSQL database hosted on Supabase, once per hour.
- For Arch Official Repositories metadata, the [official repositories web interface](https://wiki.archlinux.org/title/Official_repositories_web_interface) is used.
- For the Arch User Repository (AUR) metadata, the [AUR metadata archives](https://wiki.archlinux.org/title/Aurweb_RPC_interface#Limitations) is used to [minimise](https://lists.archlinux.org/pipermail/aur-general/2021-November/036659.html) Volery's impact on AUR traffic.
- A NextJS web user interface lets users query the database for Arch Official Repositories packages and AUR packages, pick and choose their favourite packages, and generate a [yay](https://github.com/Jguer/yay) script for convenient batch-installation.

## Setup instructions

`git clone` and `cd` into the project directory

## Supabase Setup

Create a free [Supabase](https://supabase.com) account and project, and run the SQL scripts [create_arch_official_repo.sql](database/sql/create_arch_official_repo.sql) and [create_aur.sql](database/sql/create_aur.sql) from your Supabase project dashboard.

### Declare environment variables

```bash
cp .env-dev .env.local
```

In `.env.local`, fill in the following variables

```bash
# You will need a free Supabase account and project (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Install dependencies

```bash
yarn install
```

### Run in development mode

```bash
yarn run dev
```

## Inspiration

Volery was inspired by [Ninite](https://ninite.com), a package management system for Windows. "Volery" was the [codename](https://www.instantfundas.com/2009/10/volery-single-installer-for-popular.html) of Ninite during its private beta stage, and Ninite used to [support](https://ninite.com/linux) Linux in the past.

## Disclaimer

- This project is not sponsored, endorsed, or otherwise affiliated with Arch Linux.
