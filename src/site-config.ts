export const siteConfig = {
  author: 'jesuspinar',
  title: 'Personal portfolio',
  subtitle: '',
  description: '',
  email: 'devjesuspinar@gmail.com',
  socialLinks: [
    {
      text: 'GitHub',
      href: 'https://github.com/jesuspinar',
      icon: 'i-simple-icons-github',
      header: 'i-ri-github-line',
    },
    {
      text: 'Linkedin',
      href: '',
      icon: 'i-simple-icons-linkedin',
    },
  ],
  header: {
    logo: {
      src: '/favicon.svg',
      alt: 'Logo Image',
    },
    navLinks: [
      {
        text: 'Home',
        href: '/',
      },
      {
        text: 'Blog',
        href: '/blog',
      },
      {
        text: 'Projects',
        href: '/projects',
      },
    ],
  },
  page: {
    blogLinks: [
      {
        text: 'Blog',
        href: '/blog',
      },
      {
        text: 'Notes',
        href: '/blog/notes',
      },
      {
        text: 'Talks',
        href: '/blog/talks',
      },
    ],
  },
  footer: {
    navLinks: [
      {
        text: 'GitHub Repository',
        href: 'https://github.com/jesuspinar',
      },
    ],
  },
}

export default siteConfig
