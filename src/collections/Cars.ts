import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Cars: CollectionConfig = {
  slug: 'cars',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'brand',
      type: 'text',
      required: true,
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'model',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
      slugify: ({ data }: { data: { brand: string; name: string; year: number } }) => {
        return `${data.brand}-${data.name}-${data.year}`.toLowerCase().replace(/\s+/g, '-')
      },
    }),
  ],
  timestamps: true,
  endpoints: [
    {
      path: '/by-brand/:brand',
      method: 'get',
      handler: async (req) => {
        const cars = await req.payload.find({
          collection: 'cars',
          where: {
            brand: {
              equals: req.routeParams?.brand,
            },
          },
        })
        return Response.json({ cars })
      },
    },
  ],
}
