// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { S3Client } from '@aws-sdk/client-s3'
import { describe, expect, it, vi } from 'vitest'
import { createFormAttachmentStorage } from '@/lib/formAttachmentStorage.server'

describe('private S3 attachment transport', () => {
  it('uses an independent private prefix, never public URLs or object ACLs, and bounds reads', async () => {
    const send = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never)
    try {
      const storage = createFormAttachmentStorage({
        provider: 's3',
        bucket: 'private-test-only',
        endpoint: 'https://private.example.test',
        region: 'auto',
        accessKeyId: 'synthetic-test-key',
        secretAccessKey: 'synthetic-test-secret',
        forcePathStyle: true,
      })
      const token = randomUUID()
      await storage.put(token, Buffer.from('test'))
      expect(send.mock.calls[0][0].input).toMatchObject({
        Bucket: 'private-test-only',
        Key: `form-attachments/${token}`,
        ContentType: 'application/octet-stream',
      })
      expect(send.mock.calls[0][0].input).not.toHaveProperty('ACL')
      send.mockResolvedValueOnce({
        Body: {
          transformToWebStream: () =>
            new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array([1, 2, 3]))
                controller.close()
              },
            }),
        },
        ContentLength: 3,
      } as never)
      expect(await storage.get(token)).toEqual(Buffer.from([1, 2, 3]))
      send.mockResolvedValueOnce({ Body: {}, ContentLength: 3 * 1024 * 1024 + 1 } as never)
      await expect(storage.get(token)).rejects.toThrow('storage limit')
      send.mockResolvedValueOnce({
        Body: {
          transformToWebStream: () =>
            new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array(3 * 1024 * 1024 + 1))
                controller.close()
              },
            }),
        },
      } as never)
      await expect(storage.get(token)).rejects.toThrow('storage limit')
      await storage.remove(token)
      expect(send.mock.calls.at(-1)?.[0].input).toEqual({
        Bucket: 'private-test-only',
        Key: `form-attachments/${token}`,
      })
      await expect(storage.get('../public-object')).rejects.toThrow('storage key')
    } finally {
      send.mockRestore()
    }
  })
})
