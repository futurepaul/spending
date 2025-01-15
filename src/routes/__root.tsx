import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { z } from 'zod'
import "../index.css"

export const searchSchema = z.object({
  view: z.enum(['tree', 'list']).default('tree')
})

export type SearchParams = z.infer<typeof searchSchema>

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  validateSearch: searchSchema
})