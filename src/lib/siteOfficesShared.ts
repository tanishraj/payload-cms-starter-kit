export type SiteOfficeLocationSource = {
  address?: string | null
  city?: string | null
  email?: string | null
  id?: string | null
  mapEmbedUrl?: string | null
  mapTitle?: string | null
  mapUrl?: string | null
  phone?: string | null
  region?: string | null
}

export type SiteOfficeLocation = {
  address: string
  city: string
  email: string
  id: string
  mapEmbedUrl: string
  mapTitle: string
  mapUrl: string
  phone: string
  phoneHref: string
  region: string
}

const httpsUrlError = 'Enter a complete HTTPS URL.'

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export const validateHttpsUrl = (value: unknown): true | string => {
  if (typeof value !== 'string' || !value.trim()) {
    return true
  }

  return isHttpsUrl(value.trim()) ? true : httpsUrlError
}

const trimValue = (value: string | null | undefined) => value?.trim() ?? ''

export function normalizeSiteOfficeLocations(
  values: SiteOfficeLocationSource[] | null | undefined,
): SiteOfficeLocation[] {
  return (values ?? []).flatMap((office, index): SiteOfficeLocation[] => {
    const address = trimValue(office.address)
    const city = trimValue(office.city)
    const email = trimValue(office.email)
    const mapEmbedUrl = trimValue(office.mapEmbedUrl)
    const mapTitle = trimValue(office.mapTitle)
    const mapUrl = trimValue(office.mapUrl)
    const phone = trimValue(office.phone)
    const region = trimValue(office.region)
    const phoneTarget = phone.replace(/[^\d+]/g, '')

    if (
      !address ||
      !city ||
      !email ||
      !mapTitle ||
      !phone ||
      !phoneTarget ||
      !region ||
      !isHttpsUrl(mapEmbedUrl) ||
      !isHttpsUrl(mapUrl)
    ) {
      return []
    }

    return [
      {
        address,
        city,
        email,
        id: trimValue(office.id) || `office-${index + 1}`,
        mapEmbedUrl,
        mapTitle,
        mapUrl,
        phone,
        phoneHref: `tel:${phoneTarget}`,
        region,
      },
    ]
  })
}
