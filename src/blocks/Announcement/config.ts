import type { Block } from 'payload'
import { announcementThumbnail } from './thumbnail'

export const AnnouncementBlock: Block = {
  slug: 'announcement',
  interfaceName: 'AnnouncementBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Announcement block preview',
        url: announcementThumbnail,
      },
    },
  },
  labels: {
    singular: 'Announcement',
    plural: 'Announcements',
  },
  fields: [
    {
      name: 'intervalMs',
      label: 'Announcement Interval (ms)',
      type: 'number',
      defaultValue: 4000,
      min: 2000,
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          label: 'Link URL',
          type: 'text',
        },
      ],
    },
  ],
}
