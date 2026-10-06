/** Contact links support site paths/anchors, email, phone and HTTP(S), never executable schemes. */
export const isContact6Href = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\u007f\\]/.test(value))
    return false
  if (/^\/(?!\/)|^#[^#]/.test(value)) return true
  try {
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
export const validateContact6Href = (value: unknown): true | string =>
  value == null || value === '' || isContact6Href(value)
    ? true
    : 'Use a site path, anchor, https://, http://, mailto: or tel: link.'
