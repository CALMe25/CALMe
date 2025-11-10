import React from "react";
import ComponentCreator from "@docusaurus/ComponentCreator";

export default [
  {
    path: "/CALMe/blog",
    component: ComponentCreator("/CALMe/blog", "a46"),
    exact: true,
  },
  {
    path: "/CALMe/blog/archive",
    component: ComponentCreator("/CALMe/blog/archive", "173"),
    exact: true,
  },
  {
    path: "/CALMe/blog/authors",
    component: ComponentCreator("/CALMe/blog/authors", "b3d"),
    exact: true,
  },
  {
    path: "/CALMe/blog/authors/all-sebastien-lorber-articles",
    component: ComponentCreator(
      "/CALMe/blog/authors/all-sebastien-lorber-articles",
      "803",
    ),
    exact: true,
  },
  {
    path: "/CALMe/blog/authors/yangshun",
    component: ComponentCreator("/CALMe/blog/authors/yangshun", "e90"),
    exact: true,
  },
  {
    path: "/CALMe/blog/first-blog-post",
    component: ComponentCreator("/CALMe/blog/first-blog-post", "318"),
    exact: true,
  },
  {
    path: "/CALMe/blog/long-blog-post",
    component: ComponentCreator("/CALMe/blog/long-blog-post", "96b"),
    exact: true,
  },
  {
    path: "/CALMe/blog/mdx-blog-post",
    component: ComponentCreator("/CALMe/blog/mdx-blog-post", "34b"),
    exact: true,
  },
  {
    path: "/CALMe/blog/tags",
    component: ComponentCreator("/CALMe/blog/tags", "f5f"),
    exact: true,
  },
  {
    path: "/CALMe/blog/tags/docusaurus",
    component: ComponentCreator("/CALMe/blog/tags/docusaurus", "f2d"),
    exact: true,
  },
  {
    path: "/CALMe/blog/tags/facebook",
    component: ComponentCreator("/CALMe/blog/tags/facebook", "dd1"),
    exact: true,
  },
  {
    path: "/CALMe/blog/tags/hello",
    component: ComponentCreator("/CALMe/blog/tags/hello", "1ad"),
    exact: true,
  },
  {
    path: "/CALMe/blog/tags/hola",
    component: ComponentCreator("/CALMe/blog/tags/hola", "6b1"),
    exact: true,
  },
  {
    path: "/CALMe/blog/welcome",
    component: ComponentCreator("/CALMe/blog/welcome", "2eb"),
    exact: true,
  },
  {
    path: "/CALMe/markdown-page",
    component: ComponentCreator("/CALMe/markdown-page", "71d"),
    exact: true,
  },
  {
    path: "/CALMe/search",
    component: ComponentCreator("/CALMe/search", "711"),
    exact: true,
  },
  {
    path: "/CALMe/docs",
    component: ComponentCreator("/CALMe/docs", "913"),
    routes: [
      {
        path: "/CALMe/docs",
        component: ComponentCreator("/CALMe/docs", "3a4"),
        routes: [
          {
            path: "/CALMe/docs",
            component: ComponentCreator("/CALMe/docs", "b3e"),
            routes: [
              {
                path: "/CALMe/docs/architecture",
                component: ComponentCreator("/CALMe/docs/architecture", "d57"),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/implementation",
                component: ComponentCreator(
                  "/CALMe/docs/implementation",
                  "305",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/intro",
                component: ComponentCreator("/CALMe/docs/intro", "9d3"),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/testing",
                component: ComponentCreator("/CALMe/docs/testing", "2e6"),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-basics/congratulations",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/congratulations",
                  "07f",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-basics/create-a-blog-post",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/create-a-blog-post",
                  "dd8",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-basics/create-a-document",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/create-a-document",
                  "aeb",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-basics/create-a-page",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/create-a-page",
                  "319",
                ),
                exact: true,
              },
              {
                path: "/CALMe/docs/tutorial-basics/deploy-your-site",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/deploy-your-site",
                  "d15",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-basics/markdown-features",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-basics/markdown-features",
                  "2d5",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-extras/manage-docs-versions",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-extras/manage-docs-versions",
                  "49c",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/tutorial-extras/translate-your-site",
                component: ComponentCreator(
                  "/CALMe/docs/tutorial-extras/translate-your-site",
                  "bac",
                ),
                exact: true,
                sidebar: "tutorialSidebar",
              },
              {
                path: "/CALMe/docs/user-guide",
                component: ComponentCreator("/CALMe/docs/user-guide", "615"),
                exact: true,
                sidebar: "tutorialSidebar",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/CALMe/",
    component: ComponentCreator("/CALMe/", "ab2"),
    exact: true,
  },
  {
    path: "*",
    component: ComponentCreator("*"),
  },
];
