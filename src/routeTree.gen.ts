/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ProgramAccountImport } from './routes/program/$account'
import { Route as AgencyAgencyImport } from './routes/agency/$agency'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ProgramAccountRoute = ProgramAccountImport.update({
  id: '/program/$account',
  path: '/program/$account',
  getParentRoute: () => rootRoute,
} as any)

const AgencyAgencyRoute = AgencyAgencyImport.update({
  id: '/agency/$agency',
  path: '/agency/$agency',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/agency/$agency': {
      id: '/agency/$agency'
      path: '/agency/$agency'
      fullPath: '/agency/$agency'
      preLoaderRoute: typeof AgencyAgencyImport
      parentRoute: typeof rootRoute
    }
    '/program/$account': {
      id: '/program/$account'
      path: '/program/$account'
      fullPath: '/program/$account'
      preLoaderRoute: typeof ProgramAccountImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/agency/$agency': typeof AgencyAgencyRoute
  '/program/$account': typeof ProgramAccountRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/agency/$agency': typeof AgencyAgencyRoute
  '/program/$account': typeof ProgramAccountRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/agency/$agency': typeof AgencyAgencyRoute
  '/program/$account': typeof ProgramAccountRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/agency/$agency' | '/program/$account'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/agency/$agency' | '/program/$account'
  id: '__root__' | '/' | '/agency/$agency' | '/program/$account'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  AgencyAgencyRoute: typeof AgencyAgencyRoute
  ProgramAccountRoute: typeof ProgramAccountRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  AgencyAgencyRoute: AgencyAgencyRoute,
  ProgramAccountRoute: ProgramAccountRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/agency/$agency",
        "/program/$account"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/agency/$agency": {
      "filePath": "agency/$agency.tsx"
    },
    "/program/$account": {
      "filePath": "program/$account.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
